import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  delayFromLive,
  etaFromPlaces,
  haversineKm,
  placeFromNote,
  travelMinFromKm,
  YARD_PLACE,
} from "./routing.ts";

describe("live routing kernel", () => {
  it("reads Q7 / Cat Lai / Thu Duc from a radio note, default Q7", () => {
    assert.equal(placeFromNote("51C-882.13 bên Q7 đang kẹt").id, "q7");
    assert.equal(placeFromNote("xe kẹt Cát Lái").id, "cat-lai");
    assert.equal(placeFromNote("Thu Duc jam").id, "thu-duc");
    assert.equal(placeFromNote("Truck C late 47 min").id, "q7");
  });

  it("haversine Q7 → Tan Thuan is a short inner-city hop, not a made-up hour", () => {
    const q7 = placeFromNote("Q7");
    const km = haversineKm(q7, YARD_PLACE);
    assert.ok(km > 1 && km < 12, `km=${km}`);
    const min = travelMinFromKm(km);
    assert.ok(min >= 6 && min <= 40, `min=${min}`);
  });

  it("delay is arrival minus booked slot, never negative", () => {
    const live = etaFromPlaces(placeFromNote("Q7"));
    assert.equal(delayFromLive(160, live, 0), 0);
    assert.ok(delayFromLive(160, live, 200) > 0);
    assert.equal(live.source, "haversine");
  });
});
