// File: server/hub.go
//
// Sentience world — multiplayer presence hub.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add room-based presence hub.
//
// A lightweight in-memory hub that groups connected players into rooms and fans
// each player's pose (position, yaw, animation) out to everyone else in the same
// room. Broadcasts are non-blocking per recipient (a slow client is dropped
// rather than stalling the room), so a busy room stays O(occupants) per update.

package main

import (
	"encoding/json"
	"sync"
)

// client is one connected player.
type client struct {
	id   string
	name string
	room string
	send chan []byte
}

// hub owns the set of rooms and their members.
type hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*client]bool
}

// newHub returns an empty hub.
func newHub() *hub {
	return &hub{rooms: make(map[string]map[*client]bool)}
}

// join adds c to its room and tells it about the players already present.
func (h *hub) join(c *client) {
	h.mu.Lock()
	if h.rooms[c.room] == nil {
		h.rooms[c.room] = make(map[*client]bool)
	}
	roster := make([]rosterEntry, 0, len(h.rooms[c.room]))
	for other := range h.rooms[c.room] {
		roster = append(roster, rosterEntry{ID: other.id, Name: other.name})
	}
	h.rooms[c.room][c] = true
	h.mu.Unlock()

	// Send the existing roster to the newcomer, then announce the newcomer.
	c.trySend(envelope{Type: "welcome", ID: c.id, Roster: roster})
	h.broadcast(c.room, c, envelope{Type: "join", ID: c.id, Name: c.name})
}

// leave removes c and announces its departure.
func (h *hub) leave(c *client) {
	h.mu.Lock()
	if members := h.rooms[c.room]; members != nil {
		delete(members, c)
		if len(members) == 0 {
			delete(h.rooms, c.room)
		}
	}
	h.mu.Unlock()
	h.broadcast(c.room, c, envelope{Type: "leave", ID: c.id})
}

// broadcast sends env to every member of room except `from`.
func (h *hub) broadcast(room string, from *client, env envelope) {
	data, err := json.Marshal(env)
	if err != nil {
		return
	}
	h.mu.RLock()
	members := h.rooms[room]
	targets := make([]*client, 0, len(members))
	for c := range members {
		if c != from {
			targets = append(targets, c)
		}
	}
	h.mu.RUnlock()
	for _, c := range targets {
		select {
		case c.send <- data:
		default: // drop for a slow client rather than stall the room
		}
	}
}

// trySend enqueues env to a single client, best-effort.
func (c *client) trySend(env envelope) {
	data, err := json.Marshal(env)
	if err != nil {
		return
	}
	select {
	case c.send <- data:
	default:
	}
}

// rosterEntry is one already-present player sent to a newcomer.
type rosterEntry struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// envelope is the wire message for all presence events.
type envelope struct {
	Type   string        `json:"type"` // welcome | join | leave | pose
	ID     string        `json:"id,omitempty"`
	Name   string        `json:"name,omitempty"`
	Roster []rosterEntry `json:"roster,omitempty"`
	X      float64       `json:"x,omitempty"`
	Y      float64       `json:"y,omitempty"`
	Z      float64       `json:"z,omitempty"`
	Yaw    float64       `json:"yaw,omitempty"`
	Action string        `json:"action,omitempty"`
}
