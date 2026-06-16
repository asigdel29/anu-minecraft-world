// File: src/Experience/battleship/BattleshipBoard.jsx
//
// Sentience world — in-world 3D Battleship board.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Port the dual-grid board into the world (r3f v8).
//
// Renders the player's fleet and the opponent's waters as two 10x10 grids of
// cubes floating in the world near the battleship block. During placement the
// own board accepts clicks (with a green/red footprint preview honoring the
// rotate control); during firing the opponent board accepts shots. It reads the
// authoritative view from the battleship store; the DOM HUD handles mode select
// and status. Only mounts while the game is active.

import { useState } from "react";
import { Text } from "@react-three/drei";
import { useBattleshipStore, FLEET, placedCount } from "./battleshipStore";
import { BATTLESHIP_CENTER } from "../sequence/layout";

const CELL = 0.8;
const GAP = 4; // gap between the two boards, in cells
const COLOR = {
  water: "#1b3a5b",
  ship: "#8d99ae",
  hit: "#e63946",
  miss: "#e9ecef",
  valid: "#06d6a0",
  invalid: "#ef476f",
};

function cellColor(kind, cell) {
  if (cell.shot && cell.hit) return COLOR.hit;
  if (cell.shot && !cell.hit) return COLOR.miss;
  if (kind === "own" && cell.ship) return COLOR.ship;
  return COLOR.water;
}

function footprint(x, y, len, vertical) {
  const out = [];
  for (let i = 0; i < len; i++) out.push(vertical ? [x, y + i] : [x + i, y]);
  return out;
}

function Cell({ position, color, onClick, onOver }) {
  return (
    <mesh
      position={position}
      onClick={onClick}
      onPointerOver={(e) => {
        if (onClick) e.stopPropagation();
        if (onOver) onOver();
      }}
    >
      <boxGeometry args={[CELL * 0.92, CELL * 0.92, CELL * 0.5]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Board({ board, kind, baseX, baseY, baseZ, onCell, onOver, preview }) {
  const n = board.size;
  return (
    <group>
      {board.cells.map((row, r) =>
        row.map((cell, c) => {
          let color = cellColor(kind, cell);
          if (preview && preview.cells.has(`${c},${r}`)) {
            color = preview.valid ? COLOR.valid : COLOR.invalid;
          }
          return (
            <Cell
              key={`${c}-${r}`}
              position={[baseX + (c - (n - 1) / 2) * CELL, baseY + ((n - 1) / 2 - r) * CELL, baseZ]}
              color={color}
              onClick={onCell ? () => onCell(c, r) : undefined}
              onOver={onOver ? () => onOver(c, r) : undefined}
            />
          );
        }),
      )}
    </group>
  );
}

export default function BattleshipBoard() {
  const active = useBattleshipStore((s) => s.active);
  const view = useBattleshipStore((s) => s.view);
  const orientation = useBattleshipStore((s) => s.orientation);
  const placeAt = useBattleshipStore((s) => s.placeAt);
  const shoot = useBattleshipStore((s) => s.shoot);
  const [hover, setHover] = useState(null);

  if (!active || !view) return null;

  const n = view.size;
  const span = n * CELL;
  const [ax, ay, az] = BATTLESHIP_CENTER;
  const yMid = ay + span / 2 + 1; // float the boards up to eye level
  const ownX = ax - (span + GAP * CELL) / 2;
  const oppX = ax + (span + GAP * CELL) / 2;

  const placing = view.status === "placing";
  const next = placing ? placedCount(view) : -1;
  const canPlace = placing && next >= 0 && next < FLEET.length;
  const canFire = view.status === "firing" && view.yourTurn;

  let preview;
  if (canPlace && hover) {
    const len = FLEET[next].len;
    const cells = footprint(hover[0], hover[1], len, orientation === "vertical");
    const valid = cells.every(
      ([cx, cy]) => cx >= 0 && cy >= 0 && cx < n && cy < n && !view.you.cells[cy][cx].ship,
    );
    preview = { cells: new Set(cells.map(([cx, cy]) => `${cx},${cy}`)), valid };
  }

  return (
    <group>
      <Text font="/fonts/Minecraft-Regular.ttf" position={[ownX, yMid + span / 2 + 0.7, az]} fontSize={0.7} color="#bfe9ff" anchorX="center">
        YOUR FLEET
      </Text>
      <Text font="/fonts/Minecraft-Regular.ttf" position={[oppX, yMid + span / 2 + 0.7, az]} fontSize={0.7} color="#ffd166" anchorX="center">
        ENEMY WATERS
      </Text>
      <Board
        board={view.you}
        kind="own"
        baseX={ownX}
        baseY={yMid}
        baseZ={az}
        onCell={canPlace ? (x, y) => void placeAt(x, y) : undefined}
        onOver={canPlace ? (x, y) => setHover([x, y]) : undefined}
        preview={preview}
      />
      <Board
        board={view.opponent}
        kind="opponent"
        baseX={oppX}
        baseY={yMid}
        baseZ={az}
        onCell={canFire ? (x, y) => void shoot(x, y) : undefined}
      />
    </group>
  );
}
