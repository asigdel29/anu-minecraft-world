// File: server/hub_test.go
//
// Sentience world — tests for the presence hub.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add hub join/broadcast/leave tests.

package main

import (
	"encoding/json"
	"testing"
)

// recvType drains one message from a client's queue and returns its type/id.
func recvType(t *testing.T, c *client) envelope {
	t.Helper()
	select {
	case data := <-c.send:
		var e envelope
		if err := json.Unmarshal(data, &e); err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		return e
	default:
		t.Fatal("expected a message, got none")
		return envelope{}
	}
}

func TestHubJoinBroadcastLeave(t *testing.T) {
	h := newHub()
	a := &client{id: "a", name: "Alice", room: "r", send: make(chan []byte, 8)}
	b := &client{id: "b", name: "Bob", room: "r", send: make(chan []byte, 8)}

	h.join(a)
	if e := recvType(t, a); e.Type != "welcome" || len(e.Roster) != 0 {
		t.Fatalf("a welcome = %+v, want empty roster", e)
	}

	h.join(b)
	if e := recvType(t, b); e.Type != "welcome" || len(e.Roster) != 1 || e.Roster[0].ID != "a" {
		t.Fatalf("b welcome = %+v, want roster [a]", e)
	}
	if e := recvType(t, a); e.Type != "join" || e.ID != "b" {
		t.Fatalf("a should see join(b), got %+v", e)
	}

	// A pose from b reaches a, but not b (the sender).
	h.broadcast("r", b, envelope{Type: "pose", ID: "b", X: 1})
	if e := recvType(t, a); e.Type != "pose" || e.ID != "b" {
		t.Fatalf("a should receive b's pose, got %+v", e)
	}
	select {
	case <-b.send:
		t.Fatal("sender should not receive its own pose")
	default:
	}

	h.leave(a)
	if e := recvType(t, b); e.Type != "leave" || e.ID != "a" {
		t.Fatalf("b should see leave(a), got %+v", e)
	}
}
