package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"testing"
)

func TestBarcelona98WeeksParity(t *testing.T) {
	dir := filepath.Join("..", "..", "data", "barcelona", "weeks")
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatalf("failed to read barcelona dir: %v", err)
	}
	re := regexp.MustCompile(`^bcn_(24B|36A)_(\d+)\.json$`)
	var files []string
	for _, e := range entries {
		if re.MatchString(e.Name()) {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)
	if len(files) != 98 {
		t.Fatalf("expected 98 weeks, got %d", len(files))
	}

	occ := make([][]Busy, 128)
	var ships, matches, worse, savedHours int
	for _, file := range files {
		m := re.FindStringSubmatch(file)
		quay := m[1]
		weekNum, _ := strconv.Atoi(m[2])
		instBytes, _ := os.ReadFile(filepath.Join(dir, file))
		bksBytes, _ := os.ReadFile(filepath.Join(dir, "bks-"+file))
		var inst InstanceFile
		var bks BksFile
		_ = json.Unmarshal(instBytes, &inst)
		_ = json.Unmarshal(bksBytes, &bks)
		byID := make(map[int]BksShip, len(bks.Ships))
		for _, s := range bks.Ships {
			byID[int(s.DataShipID)] = s
		}
		nShips := int(inst.NShips)
		var calls []CallFact
		for id := 0; id < nShips; id++ {
			ship, ok := byID[id]
			if !ok || int(inst.HandlingTime[id]) < 1 || int(inst.ShipLen[id]) < 1 {
				continue
			}
			calls = append(calls, CallFact{
				ID:       id,
				Arrival:  int(inst.ArrivalTime[id]),
				Handling: int(inst.HandlingTime[id]),
				Span:     int(inst.ShipLen[id]),
				Moor:     int(ship.MooringTime),
				Berth:    int(ship.MooringBerth),
			})
		}
		w := WeekData{
			File:     file,
			Quay:     quay,
			Week:     weekNum,
			NBerths:  int(inst.NBerths),
			NPeriods: int(inst.NPeriods),
			Calls:    calls,
		}
		s, ma, wo, sh := probeWeek(&w, occ)
		ships += s
		matches += ma
		worse += wo
		savedHours += sh
	}

	if ships != 3092 {
		t.Fatalf("expected 3092 ships, got %d", ships)
	}
	if matches != 2567 {
		t.Fatalf("expected 2567 matches, got %d", matches)
	}
	if worse != 525 {
		t.Fatalf("expected 525 worse, got %d", worse)
	}
	if savedHours != 19801 {
		t.Fatalf("expected 19801 savedHours, got %d", savedHours)
	}
}
