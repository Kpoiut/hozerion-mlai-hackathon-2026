package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"time"
)

type InstanceFile struct {
	NBerths      float64   `json:"n_berths"`
	BerthLen     []float64 `json:"berth_len"`
	NShips       float64   `json:"n_ships"`
	NPeriods     float64   `json:"n_periods"`
	ArrivalTime  []float64 `json:"arrival_time"`
	HandlingTime []float64 `json:"handling_time"`
	ShipLen      []float64 `json:"ship_len"`
}

type BksShip struct {
	DataShipID       float64 `json:"data_ship_id"`
	DataArrivalTime  float64 `json:"data_arrival_time"`
	DataHandlingTime float64 `json:"data_handling_time"`
	DataShipLength   float64 `json:"data_ship_length"`
	MooringTime      float64 `json:"mooring_time"`
	MooringBerth     float64 `json:"mooring_berth"`
}

type BksFile struct {
	Ships []BksShip `json:"ships"`
}

type Busy struct {
	Start int
	End   int
}

type CallFact struct {
	ID       int
	Arrival  int
	Handling int
	Span     int
	Moor     int
	Berth    int
}

type WeekData struct {
	File     string
	Quay     string
	Week     int
	NBerths  int
	NPeriods int
	Calls    []CallFact
}

// earliestSpanFit computes the earliest conflict-free start >= eta across sections [left, left+span)
// using zero-allocation conflict-driven jumping.
func earliestSpanFit(occ [][]Busy, left, span, eta, dur, horizon int) int {
	if span < 1 || left < 0 || left+span > len(occ) || dur <= 0 {
		return -1
	}
	s := eta
	if s < 0 {
		s = 0
	}
	endDock := left + span
	for s+dur <= horizon {
		advanced := false
		for d := left; d < endDock; d++ {
			busy := occ[d]
			for j := 0; j < len(busy); j++ {
				b := busy[j]
				if b.Start >= s+dur {
					break
				}
				if b.End > s {
					s = b.End
					advanced = true
					break
				}
			}
			if advanced {
				break
			}
		}
		if !advanced {
			return s
		}
	}
	return -1
}

func addBusy(busy []Busy, start, end int) []Busy {
	i := 0
	for i < len(busy) && busy[i].Start < start {
		i++
	}
	busy = append(busy, Busy{})
	copy(busy[i+1:], busy[i:])
	busy[i] = Busy{Start: start, End: end}
	return busy
}

type ProbeResult struct {
	PlanDock  int
	PlanStart int
	PlanWait  int
	HoldDock  int
	HoldStart int
	HoldWait  int
	Matches   bool
	Saved     int
}

func probeWeek(w *WeekData, occ [][]Busy) (ships, matches, worse, savedHours int) {
	if cap(occ) < w.NBerths {
		occ = make([][]Busy, w.NBerths)
	} else {
		occ = occ[:w.NBerths]
	}

	for idx, target := range w.Calls {
		for d := 0; d < w.NBerths; d++ {
			occ[d] = occ[d][:0]
		}
		for j, other := range w.Calls {
			if j == idx {
				continue
			}
			endDock := other.Berth + other.Span
			if endDock > w.NBerths {
				endDock = w.NBerths
			}
			for d := other.Berth; d < endDock; d++ {
				occ[d] = addBusy(occ[d], other.Moor, other.Moor+other.Handling)
			}
		}

		eta := target.Moor + 1
		bestDock := -1
		bestStart := -1
		bestWait := 1 << 30
		bestDch := 1 << 30

		for d := 0; d+target.Span <= w.NBerths; d++ {
			s := earliestSpanFit(occ, d, target.Span, eta, target.Handling, w.NPeriods)
			if s < 0 {
				continue
			}
			wait := s - eta
			dch := 0
			if d != target.Berth {
				dch = 1
			}
			if bestDock == -1 || wait < bestWait || (wait == bestWait && dch < bestDch) || (wait == bestWait && dch == bestDch && d < bestDock) {
				bestDock = d
				bestStart = s
				bestWait = wait
				bestDch = dch
			}
		}

		ships++
		if bestDock == target.Berth {
			matches++
			continue
		}

		holdStart := earliestSpanFit(occ, target.Berth, target.Span, eta, target.Handling, w.NPeriods)
		holdWait := holdStart - eta
		saved := holdWait - bestWait
		if saved == 0 && holdStart == bestStart && target.Berth == bestDock {
			matches++
		} else if saved > 0 {
			worse++
			savedHours += saved
		}
	}
	return ships, matches, worse, savedHours
}

// Benchmark 3D RTG Bay Min-Rehandle in Go (10,000 iterations)
func benchRtgMinRehandle(iterations int) (time.Duration, int) {
	t0 := time.Now()
	totalMoves := 0
	// 5 rows x 4 tiers, target at row 0 tier 0 with 2 blockers above
	pickup := [5][4]int{
		{1, 5, 3, 0},
		{2, 6, 0, 0},
		{4, 8, 9, 0},
		{7, 10, 0, 0},
		{11, 0, 0, 0},
	}
	heights := [5]int{3, 2, 3, 2, 1}

	for iter := 0; iter < iterations; iter++ {
		p := pickup
		h := heights
		targetRow := 0
		targetTier := 0
		moves := 0
		for h[targetRow]-1 > targetTier {
			topTier := h[targetRow] - 1
			blockerOrder := p[targetRow][topTier]
			bestRow := -1
			bestScore := 1 << 30
			for r := 0; r < 5; r++ {
				if r == targetRow || h[r] >= 4 {
					continue
				}
				minSupport := 999
				for t := 0; t < h[r]; t++ {
					if p[r][t] < minSupport {
						minSupport = p[r][t]
					}
				}
				var score int
				if minSupport > blockerOrder {
					score = (minSupport - blockerOrder) * 10
				} else {
					score = 10000 + (blockerOrder-minSupport)*500
				}
				if score < bestScore {
					bestScore = score
					bestRow = r
				}
			}
			p[bestRow][h[bestRow]] = blockerOrder
			h[bestRow]++
			h[targetRow]--
			moves++
		}
		totalMoves += moves
	}
	return time.Since(t0), totalMoves
}

type BenchReport struct {
	GoVersion           string  `json:"goVersion"`
	Arch                string  `json:"arch"`
	WeeksLoaded         int     `json:"weeksLoaded"`
	TotalProbes         int     `json:"totalProbes"`
	UncontestedMatches  int     `json:"uncontestedMatches"`
	ContestedWorse      int     `json:"contestedWorse"`
	TotalSavedHours     int     `json:"totalSavedHours"`
	SinglePassSolveMs   float64 `json:"singlePassSolveMs"`
	AvgSolveWaitUs      float64 `json:"avgSolveWaitUs"`
	Rtg10kIterationsMs  float64 `json:"rtg10kIterationsMs"`
}

func main() {
	dir := filepath.Join("..", "..", "data", "barcelona", "weeks")
	entries, err := os.ReadDir(dir)
	if err != nil {
		dir = filepath.Join("data", "barcelona", "weeks")
		entries, err = os.ReadDir(dir)
		if err != nil {
			panic(err)
		}
	}

	re := regexp.MustCompile(`^bcn_(24B|36A)_(\d+)\.json$`)
	var files []string
	for _, e := range entries {
		if re.MatchString(e.Name()) {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	var weeks []WeekData
	for _, file := range files {
		m := re.FindStringSubmatch(file)
		quay := m[1]
		weekNum, _ := strconv.Atoi(m[2])
		instBytes, err := os.ReadFile(filepath.Join(dir, file))
		if err != nil {
			panic(err)
		}
		bksBytes, err := os.ReadFile(filepath.Join(dir, "bks-"+file))
		if err != nil {
			panic(err)
		}
		var inst InstanceFile
		var bks BksFile
		if err := json.Unmarshal(instBytes, &inst); err != nil {
			panic(err)
		}
		if err := json.Unmarshal(bksBytes, &bks); err != nil {
			panic(err)
		}
		byID := make(map[int]BksShip, len(bks.Ships))
		for _, s := range bks.Ships {
			byID[int(s.DataShipID)] = s
		}
		nShips := int(inst.NShips)
		var calls []CallFact
		for id := 0; id < nShips; id++ {
			ship, ok := byID[id]
			if !ok {
				continue
			}
			h := int(inst.HandlingTime[id])
			sp := int(inst.ShipLen[id])
			arr := int(inst.ArrivalTime[id])
			if h < 1 || sp < 1 {
				continue
			}
			calls = append(calls, CallFact{
				ID:       id,
				Arrival:  arr,
				Handling: h,
				Span:     sp,
				Moor:     int(ship.MooringTime),
				Berth:    int(ship.MooringBerth),
			})
		}
		weeks = append(weeks, WeekData{
			File:     file,
			Quay:     quay,
			Week:     weekNum,
			NBerths:  int(inst.NBerths),
			NPeriods: int(inst.NPeriods),
			Calls:    calls,
		})
	}

	// Run 20 warmup + timed passes over all 98 weeks (3,092 ship probes per pass = 61,840 probes)
	occ := make([][]Busy, 128)
	for d := range occ {
		occ[d] = make([]Busy, 0, 32)
	}

	var ships, matches, worse, savedHours int
	const passes = 20
	t0 := time.Now()
	for p := 0; p < passes; p++ {
		ships, matches, worse, savedHours = 0, 0, 0, 0
		for i := range weeks {
			s, m, w, h := probeWeek(&weeks[i], occ)
			ships += s
			matches += m
			worse += w
			savedHours += h
		}
	}
	elapsed := time.Since(t0)
	singlePassMs := float64(elapsed.Microseconds()) / 1000.0 / float64(passes)
	avgUs := float64(elapsed.Microseconds()) / float64(passes*ships)

	rtgDur, _ := benchRtgMinRehandle(10000)

	report := BenchReport{
		GoVersion:          strings.TrimPrefix(runtime.Version(), "go"),
		Arch:               runtime.GOOS + "/" + runtime.GOARCH,
		WeeksLoaded:        len(weeks),
		TotalProbes:        ships,
		UncontestedMatches: matches,
		ContestedWorse:     worse,
		TotalSavedHours:    savedHours,
		SinglePassSolveMs:  float64(int(singlePassMs*100+0.5)) / 100.0,
		AvgSolveWaitUs:     float64(int(avgUs*100+0.5)) / 100.0,
		Rtg10kIterationsMs: float64(int(float64(rtgDur.Microseconds())/10.0+0.5)) / 100.0,
	}
	out, _ := json.MarshalIndent(report, "", "  ")
	fmt.Println(string(out))
}
