import { describe, it, expect } from "vitest";

import {
  ROOM,
  SEND_INTERVAL,
  parseMessage,
  roomUrl,
  shouldSend,
} from "./multiplayerProtocol";

describe("roomUrl", () => {
  it("uses ws for a localhost dev host", () => {
    expect(roomUrl("localhost:1999")).toBe(`ws://localhost:1999/party/${ROOM}`);
  });

  it("uses wss for a deployed host", () => {
    expect(roomUrl("anu-minecraft-world.anubhavsigdel.workers.dev")).toBe(
      `wss://anu-minecraft-world.anubhavsigdel.workers.dev/party/${ROOM}`
    );
  });

  it("returns null for an empty host so the caller runs solo", () => {
    expect(roomUrl("")).toBeNull();
    expect(roomUrl(undefined)).toBeNull();
  });
});

describe("parseMessage", () => {
  it("parses a valid JSON object", () => {
    expect(parseMessage('{"type":"state","yaw":1}')).toEqual({
      type: "state",
      yaw: 1,
    });
  });

  it("returns null for malformed JSON", () => {
    expect(parseMessage("not json")).toBeNull();
  });

  it("returns null for non-object JSON (a bare number or null)", () => {
    expect(parseMessage("42")).toBeNull();
    expect(parseMessage("null")).toBeNull();
  });
});

describe("shouldSend", () => {
  it("blocks a send before the interval elapses", () => {
    expect(shouldSend(1000, 950, 100)).toBe(false);
  });

  it("allows a send once the interval has elapsed", () => {
    expect(shouldSend(1100, 1000, 100)).toBe(true);
  });

  it("defaults to the 10 Hz SEND_INTERVAL", () => {
    expect(shouldSend(SEND_INTERVAL, 0)).toBe(true);
    expect(shouldSend(SEND_INTERVAL - 1, 0)).toBe(false);
  });
});
