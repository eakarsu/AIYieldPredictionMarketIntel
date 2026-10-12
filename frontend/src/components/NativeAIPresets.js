import React from 'react';

const scenarios = {
  "AIYieldPrediction": [
    [
      "Spring corn",
      {
        "farm_name": "North Ridge Farm",
        "crop_type": "Corn",
        "season": "2027 spring",
        "acreage": "120",
        "soil_type": "Silt loam",
        "irrigation_type": "Center pivot",
        "historical_notes": "Three prior seasons averaged 165 bushels per acre; spring planting follows a wet winter."
      }
    ],
    [
      "Rainfed wheat",
      {
        "farm_name": "Prairie View Farm",
        "crop_type": "Winter wheat",
        "season": "2027 harvest",
        "acreage": "85",
        "soil_type": "Clay loam",
        "irrigation_type": "Rainfed",
        "historical_notes": "Recent harvests averaged 58 bushels per acre; monitor late spring rainfall."
      }
    ],
    [
      "Drip tomatoes",
      {
        "farm_name": "Valley Produce",
        "crop_type": "Tomato",
        "season": "2027 summer",
        "acreage": "18",
        "soil_type": "Sandy loam",
        "irrigation_type": "Drip",
        "historical_notes": "Greenhouse starts transplanted in May; previous yield averaged 32 tons per acre."
      }
    ]
  ],
  "AIMarketTrendForecast": [
    [
      "Corn basis",
      {
        "commodity": "Corn",
        "market": "Chicago regional cash",
        "horizon": "6 months",
        "current_price": "4.35",
        "notes": "Compare local basis with futures; summer rainfall and storage capacity are key uncertainties."
      }
    ],
    [
      "Soy export",
      {
        "commodity": "Soybeans",
        "market": "Gulf export",
        "horizon": "3 months",
        "current_price": "10.80",
        "notes": "Review export demand, freight costs, and South American harvest estimates."
      }
    ],
    [
      "Wheat harvest",
      {
        "commodity": "Hard red winter wheat",
        "market": "Kansas City cash",
        "horizon": "9 months",
        "current_price": "5.70",
        "notes": "Consider protein premiums, winter conditions, and regional inventory."
      }
    ]
  ],
  "AIPestOutbreakPrediction": [
    [
      "Corn scouting",
      {
        "crop": "Corn",
        "region": "Central Iowa",
        "horizon_days": "21",
        "weather_summary": "Warm humid week with two storms and nighttime lows near 18\u00b0C.",
        "recent_observations": "Scouting found leaf feeding on 6 of 40 plants; trap counts rose this week."
      }
    ],
    [
      "Vineyard watch",
      {
        "crop": "Grapes",
        "region": "Finger Lakes, New York",
        "horizon_days": "14",
        "weather_summary": "Three wet days followed by mild temperatures and persistent leaf moisture.",
        "recent_observations": "Two blocks have early powdery mildew symptoms; neighboring blocks appear clear."
      }
    ],
    [
      "Tomato greenhouse",
      {
        "crop": "Tomatoes",
        "region": "Salinas Valley, California",
        "horizon_days": "30",
        "weather_summary": "Dry afternoons with cool nights; greenhouse humidity briefly exceeds 85%.",
        "recent_observations": "Yellow sticky traps captured whiteflies in two rows; inspect undersides of leaves."
      }
    ]
  ],
  "AIIrrigationOptimize": [
    [
      "Corn pivot",
      {
        "crop": "Corn",
        "acreage": "120",
        "soilType": "Silt loam",
        "irrigationMethod": "Center pivot",
        "recentRainfallMm": "8",
        "forecastRainfallMm": "12",
        "growthStage": "Tasseling",
        "region": "Central Iowa"
      }
    ],
    [
      "Wheat rainfed",
      {
        "crop": "Winter wheat",
        "acreage": "85",
        "soilType": "Clay loam",
        "irrigationMethod": "Supplemental sprinkler",
        "recentRainfallMm": "22",
        "forecastRainfallMm": "5",
        "growthStage": "Heading",
        "region": "Western Kansas"
      }
    ],
    [
      "Tomato drip",
      {
        "crop": "Tomatoes",
        "acreage": "18",
        "soilType": "Sandy loam",
        "irrigationMethod": "Drip",
        "recentRainfallMm": "0",
        "forecastRainfallMm": "2",
        "growthStage": "Fruit set",
        "region": "Salinas Valley, California"
      }
    ]
  ],
  "AISoilAmendment": [
    [
      "Corn soil test",
      {
        "ph": "6.2",
        "nitrogen": "18",
        "phosphorus": "24",
        "potassium": "115",
        "organicMatterPct": "2.8",
        "moisturePct": "21",
        "targetCrop": "Corn",
        "acreage": "120"
      }
    ],
    [
      "Wheat soil test",
      {
        "ph": "7.1",
        "nitrogen": "12",
        "phosphorus": "17",
        "potassium": "145",
        "organicMatterPct": "3.4",
        "moisturePct": "18",
        "targetCrop": "Winter wheat",
        "acreage": "85"
      }
    ],
    [
      "Tomato soil test",
      {
        "ph": "6.5",
        "nitrogen": "32",
        "phosphorus": "41",
        "potassium": "180",
        "organicMatterPct": "4.1",
        "moisturePct": "24",
        "targetCrop": "Tomatoes",
        "acreage": "18"
      }
    ]
  ],
  "AIEquipmentMaintenance": [
    [
      "Tractor service",
      {
        "equipmentName": "Field tractor",
        "type": "Tractor",
        "ageYears": "7",
        "hoursUsed": "4200",
        "lastService": "2026-08-15",
        "knownIssuesCSV": "hydraulic hose seep, tire wear",
        "status": "degraded"
      }
    ],
    [
      "Combine check",
      {
        "equipmentName": "Harvest combine",
        "type": "Combine",
        "ageYears": "5",
        "hoursUsed": "3100",
        "lastService": "2026-09-01",
        "knownIssuesCSV": "header vibration, belt squeal",
        "status": "needs_attention"
      }
    ],
    [
      "Sprayer inspection",
      {
        "equipmentName": "Boom sprayer",
        "type": "Sprayer",
        "ageYears": "3",
        "hoursUsed": "950",
        "lastService": "2026-07-20",
        "knownIssuesCSV": "nozzle calibration due, filter inspection",
        "status": "operational"
      }
    ]
  ]
};

export default function NativeAIPresets({ feature, onFill, disabled = false }) {
  return <div className="ai-preset-bar"><div><strong>Example scenarios</strong><p>Fill all required and optional fields. Review before generating.</p></div><div className="ai-actions">{scenarios[feature].map(([label, fields]) => <button key={label} type="button" className="btn btn-secondary" disabled={disabled} onClick={() => onFill(fields)}>{label}</button>)}</div></div>;
}
