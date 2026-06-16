// File: server/main.go
//
// Sentience world — multiplayer presence server entry point.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add WebSocket presence server.
//
// Command worldserver relays player presence for the Sentience world: each
// client streams its pose (position, yaw, animation) and the server fans it out
// to everyone else in the same room, so players see each other's Steves move in
// real time. State is ephemeral (in-memory rooms); no persistence is needed.
// Configured from the environment so the same binary runs locally and on Railway.

package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/coder/websocket"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	if err := run(logger); err != nil {
		logger.Error("server exited", "err", err)
		os.Exit(1)
	}
}

// run wires the HTTP routes and serves until interrupted.
func run(logger *slog.Logger) error {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	h := newHub()
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	mux.HandleFunc("GET /ws", func(w http.ResponseWriter, r *http.Request) { serveWS(h, w, r, logger) })

	addr := ":" + env("PORT", "8090")
	srv := &http.Server{Addr: addr, Handler: mux, ReadHeaderTimeout: 5 * time.Second}

	errCh := make(chan error, 1)
	go func() {
		logger.Info("world server listening", "addr", addr)
		errCh <- srv.ListenAndServe()
	}()

	select {
	case err := <-errCh:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	}
}

// serveWS upgrades the connection, registers the player, and pumps pose messages
// between the socket and the hub until the client disconnects.
func serveWS(h *hub, w http.ResponseWriter, r *http.Request, logger *slog.Logger) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{OriginPatterns: []string{"*"}})
	if err != nil {
		return
	}
	defer func() { _ = conn.CloseNow() }()

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	name := r.URL.Query().Get("name")
	if name == "" {
		name = "Steve"
	}
	room := r.URL.Query().Get("room")
	if room == "" {
		room = "sentience"
	}
	c := &client{id: newID(), name: name, room: room, send: make(chan []byte, 32)}
	h.join(c)
	defer h.leave(c)

	// Writer: drain the client's send queue to the socket.
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case data := <-c.send:
				writeCtx, wcancel := context.WithTimeout(ctx, 5*time.Second)
				err := conn.Write(writeCtx, websocket.MessageText, data)
				wcancel()
				if err != nil {
					cancel()
					return
				}
			}
		}
	}()

	// Reader: each inbound pose is stamped with the sender and broadcast.
	for {
		_, data, err := conn.Read(ctx)
		if err != nil {
			return
		}
		var env envelope
		if json.Unmarshal(data, &env) != nil || env.Type != "pose" {
			continue
		}
		env.ID = c.id
		env.Name = c.name
		h.broadcast(c.room, c, env)
	}
}

// newID returns a random 64-bit hex id for a connection.
func newID() string {
	var b [8]byte
	_, _ = rand.Read(b[:])
	return hex.EncodeToString(b[:])
}

// env returns the value of key or def when unset.
func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
