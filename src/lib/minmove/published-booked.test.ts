import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { blockedExampleYard, bookedHeadline, probeBooked, stretchClear, stretchShips, tryPublishedYard } from "./published-week.ts";

describe("booked berth across the published weeks", () => {
  it("rebuilds stay-versus-plan on every paired week", () => {
    const dir = join(process.cwd(), "data/barcelona/weeks");
    const files = readdirSync(dir)
      .filter((name) => /^bcn_(24B|36A)_\d+\.json$/.test(name))
      .sort();
    let ships = 0;
    let matches = 0;
    let worse = 0;
    let holdInfeasible = 0;
    let planInfeasible = 0;
    let hours = 0;
    let planMoves = 0;
    let holdMoves = 0;
    let loaded = 0;
    for (const file of files) {
      const match = file.match(/^bcn_(24B|36A)_(\d+)\.json$/);
      if (!match?.[1] || !match[2]) continue;
      const quay = match[1];
      const week = Number(match[2]);
      const inst = JSON.parse(readFileSync(join(dir, file), "utf8")) as unknown;
      const bks = JSON.parse(readFileSync(join(dir, `bks-${file}`), "utf8")) as unknown;
      const built = tryPublishedYard(`bcn-${quay}-${week}`, quay, week, file, `bks-${file}`, inst, bks);
      assert.ok(built, file);
      loaded += 1;
      for (const row of probeBooked(built.yard)) {
        ships += 1;
        if (row.planStatus !== "OPTIMAL") planInfeasible += 1;
        planMoves += row.planMoves ?? 0;
        if (row.matches) {
          matches += 1;
          assert.equal(row.saved, 0);
          continue;
        }
        if (row.holdStatus !== "OPTIMAL") {
          holdInfeasible += 1;
          continue;
        }
        holdMoves += row.holdMoves ?? 0;
        if ((row.saved ?? 0) > 0) {
          worse += 1;
          hours += row.saved ?? 0;
        }
      }
    }
    assert.equal(loaded, 98);
    assert.equal(files.length, 98);
    assert.equal(ships, 3092);
    assert.equal(planInfeasible, 0);
    assert.equal(matches, 2567);
    assert.equal(worse, 525);
    assert.equal(holdInfeasible, 0);
    assert.equal(hours, 19801);
    assert.equal(planMoves, 0);
    assert.equal(holdMoves, 0);
  });

  it("week 47 call S8 misses its window by one hour and berth 5 is open", () => {
    const dir = join(process.cwd(), "data/barcelona/weeks");
    const file = "bcn_24B_47.json";
    const inst = JSON.parse(readFileSync(join(dir, file), "utf8")) as unknown;
    const bks = JSON.parse(readFileSync(join(dir, `bks-${file}`), "utf8")) as unknown;
    const built = tryPublishedYard("bcn-24B-47", "24B", 47, file, `bks-${file}`, inst, bks);
    assert.ok(built);
    const row = probeBooked(built.yard).find((item) => item.id === "S8");
    assert.ok(row);
    assert.equal(row.planStatus, "OPTIMAL");
    assert.equal(row.planDock, "B5");
    assert.equal(row.planStart, 5);
    assert.equal(row.planWait, 0);
    assert.equal(row.planMoves, 0);
    assert.equal(row.holdStatus, "OPTIMAL");
    assert.equal(row.holdDock, "B0");
    assert.equal(row.holdStart, 198);
    assert.equal(row.holdWait, 193);
    assert.equal(row.holdMoves, 0);
    assert.equal(row.saved, 193);
    assert.equal(row.matches, false);
    assert.equal(row.leftmostDock, "B0");
    assert.equal(row.leftmostStart, 198);
    assert.equal(
      bookedHeadline(row),
      "Staying on berth 0 waits 193h. The plan waits 0h on berth 5.",
    );
  });

  it("names the published ships that keep S8 off berth 0 until hour 198", () => {
    const yard = blockedExampleYard();
    assert.equal(yard.id, "bcn-24B-47");
    const chain = stretchShips(yard, "S8", "B0", 6, 5, 198);
    assert.deepEqual(
      chain.map((ship) => ship.id),
      ["S2", "S5", "S6", "S0", "S10", "S1", "S7", "S3"],
    );
    assert.equal(chain[0]?.start, 20);
    assert.equal(chain[chain.length - 1]?.end, 198);
    assert.equal(stretchClear(yard, "S8", "B0", 6, 5, 21), false);
    assert.equal(stretchClear(yard, "S8", "B5", 6, 5, 21), true);
  });
});
