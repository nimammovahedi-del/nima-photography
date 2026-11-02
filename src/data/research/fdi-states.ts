// State-level data from the thesis appendix ("State-Level Foreign Direct Investment and Per Capita
// Allocation (2010–2020)", "Chapter I Outliers" and "Chapter II Outliers" tables).
// level: FDI restriction level, 1 Minimal · 2 Transparent · 3 Selective · 4 High
// tier: Chinese FDI tier, 1 <$100M · 2 $100–500M · 3 $0.5–2B · 4 $2–10B · 5 >$10B
// politics: political-leaning score, −8 (strong Republican) to +8 (strong Democratic)
// These reproduce the thesis's Spearman results: ρ(level, tier) = −0.32, ρ(politics, level) = −0.55.
export interface StateRow { name: string; fdi: number; perCapita: number; level: 1|2|3|4; tier: 1|2|3|4|5; politics: number }
export const states: StateRow[] = [
{
"name": "Alabama",
"fdi": 457600000.0,
"perCapita": 91.08,
"level": 3,
"tier": 2,
"politics": -8
},
{
"name": "Alaska",
"fdi": 50000000.0,
"perCapita": 68.18,
"level": 4,
"tier": 1,
"politics": -8
},
{
"name": "Arizona",
"fdi": 1010000000.0,
"perCapita": 141.23,
"level": 3,
"tier": 3,
"politics": -4
},
{
"name": "Arkansas",
"fdi": 50000000.0,
"perCapita": 16.6,
"level": 4,
"tier": 1,
"politics": -8
},
{
"name": "California",
"fdi": 36430000000.0,
"perCapita": 921.39,
"level": 2,
"tier": 5,
"politics": 8
},
{
"name": "Colorado",
"fdi": 1920000000.0,
"perCapita": 332.54,
"level": 3,
"tier": 3,
"politics": 8
},
{
"name": "Connecticut",
"fdi": 213080000.0,
"perCapita": 59.09,
"level": 2,
"tier": 2,
"politics": 8
},
{
"name": "Delaware",
"fdi": 720100000.0,
"perCapita": 727.41,
"level": 1,
"tier": 3,
"politics": 8
},
{
"name": "Florida",
"fdi": 1640000000.0,
"perCapita": 76.14,
"level": 4,
"tier": 3,
"politics": -8
},
{
"name": "Georgia",
"fdi": 4040000000.0,
"perCapita": 377.15,
"level": 3,
"tier": 4,
"politics": -4
},
{
"name": "Hawaii",
"fdi": 50000000.0,
"perCapita": 34.36,
"level": 4,
"tier": 1,
"politics": 8
},
{
"name": "Idaho",
"fdi": 50000000.0,
"perCapita": 27.19,
"level": 4,
"tier": 1,
"politics": -8
},
{
"name": "Illinois",
"fdi": 14130000000.0,
"perCapita": 1102.83,
"level": 1,
"tier": 5,
"politics": 8
},
{
"name": "Indiana",
"fdi": 336350000.0,
"perCapita": 49.57,
"level": 4,
"tier": 2,
"politics": -8
},
{
"name": "Iowa",
"fdi": 298650000.0,
"perCapita": 93.61,
"level": 4,
"tier": 2,
"politics": -8
},
{
"name": "Kansas",
"fdi": 1730000000.0,
"perCapita": 588.86,
"level": 3,
"tier": 3,
"politics": -4
},
{
"name": "Kentucky",
"fdi": 9460000000.0,
"perCapita": 2099.5,
"level": 3,
"tier": 4,
"politics": -4
},
{
"name": "Louisiana",
"fdi": 908500000.0,
"perCapita": 195.05,
"level": 3,
"tier": 3,
"politics": -4
},
{
"name": "Maine",
"fdi": 348240000.0,
"perCapita": 255.62,
"level": 2,
"tier": 2,
"politics": 8
},
{
"name": "Maryland",
"fdi": 538460000.0,
"perCapita": 87.17,
"level": 2,
"tier": 3,
"politics": 4
},
{
"name": "Massachusetts",
"fdi": 6090000000.0,
"perCapita": 866.3,
"level": 2,
"tier": 4,
"politics": 4
},
{
"name": "Michigan",
"fdi": 4700000000.0,
"perCapita": 466.39,
"level": 3,
"tier": 4,
"politics": 0
},
{
"name": "Minnesota",
"fdi": 2670000000.0,
"perCapita": 467.89,
"level": 3,
"tier": 4,
"politics": 4
},
{
"name": "Mississippi",
"fdi": 60000000.0,
"perCapita": 20.26,
"level": 4,
"tier": 1,
"politics": -8
},
{
"name": "Missouri",
"fdi": 402000000.0,
"perCapita": 65.31,
"level": 4,
"tier": 2,
"politics": -8
},
{
"name": "Montana",
"fdi": 50000000.0,
"perCapita": 46.12,
"level": 1,
"tier": 1,
"politics": -4
},
{
"name": "Nebraska",
"fdi": 65800000.0,
"perCapita": 33.55,
"level": 4,
"tier": 1,
"politics": -6
},
{
"name": "Nevada",
"fdi": 557090000.0,
"perCapita": 179.44,
"level": 1,
"tier": 3,
"politics": 8
},
{
"name": "New Hampshire",
"fdi": 174460000.0,
"perCapita": 126.65,
"level": 1,
"tier": 2,
"politics": -4
},
{
"name": "New Jersey",
"fdi": 1460000000.0,
"perCapita": 157.18,
"level": 2,
"tier": 3,
"politics": 8
},
{
"name": "New Mexico",
"fdi": 150000000.0,
"perCapita": 70.84,
"level": 2,
"tier": 2,
"politics": 8
},
{
"name": "New York",
"fdi": 32520000000.0,
"perCapita": 1609.8,
"level": 2,
"tier": 5,
"politics": 8
},
{
"name": "North Carolina",
"fdi": 1360000000.0,
"perCapita": 130.28,
"level": 2,
"tier": 3,
"politics": -4
},
{
"name": "North Dakota",
"fdi": 50000000.0,
"perCapita": 64.18,
"level": 4,
"tier": 1,
"politics": -8
},
{
"name": "Ohio",
"fdi": 1680000000.0,
"perCapita": 142.38,
"level": 4,
"tier": 3,
"politics": -8
},
{
"name": "Oklahoma",
"fdi": 3670000000.0,
"perCapita": 926.92,
"level": 3,
"tier": 4,
"politics": -8
},
{
"name": "Oregon",
"fdi": 324260000.0,
"perCapita": 76.53,
"level": 4,
"tier": 2,
"politics": 8
},
{
"name": "Pennsylvania",
"fdi": 3090000000.0,
"perCapita": 237.64,
"level": 1,
"tier": 4,
"politics": 0
},
{
"name": "Rhode Island",
"fdi": 57000000.0,
"perCapita": 51.94,
"level": 2,
"tier": 1,
"politics": 8
},
{
"name": "South Carolina",
"fdi": 3340000000.0,
"perCapita": 652.54,
"level": 3,
"tier": 4,
"politics": -8
},
{
"name": "South Dakota",
"fdi": 50000000.0,
"perCapita": 56.39,
"level": 4,
"tier": 1,
"politics": -8
},
{
"name": "Tennessee",
"fdi": 1910000000.0,
"perCapita": 276.38,
"level": 3,
"tier": 3,
"politics": -8
},
{
"name": "Texas",
"fdi": 8800000000.0,
"perCapita": 301.93,
"level": 4,
"tier": 4,
"politics": -8
},
{
"name": "Utah",
"fdi": 102110000.0,
"perCapita": 31.21,
"level": 1,
"tier": 2,
"politics": -8
},
{
"name": "Vermont",
"fdi": 50000000.0,
"perCapita": 77.75,
"level": 2,
"tier": 1,
"politics": 4
},
{
"name": "Virginia",
"fdi": 15480000000.0,
"perCapita": 1793.45,
"level": 1,
"tier": 5,
"politics": 8
},
{
"name": "Washington",
"fdi": 2110000000.0,
"perCapita": 273.84,
"level": 1,
"tier": 4,
"politics": 8
},
{
"name": "West Virginia",
"fdi": 67000000.0,
"perCapita": 37.35,
"level": 1,
"tier": 1,
"politics": -8
},
{
"name": "Wisconsin",
"fdi": 555620000.0,
"perCapita": 94.27,
"level": 4,
"tier": 3,
"politics": 0
},
{
"name": "Wyoming",
"fdi": 635000000.0,
"perCapita": 1100.8,
"level": 3,
"tier": 3,
"politics": -8
}
];
