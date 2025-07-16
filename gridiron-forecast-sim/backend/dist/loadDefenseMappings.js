"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllDefenseMappings = void 0;
// Backend utility for loading defense mappings from CSV files
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Helper to load a CSV file and return a mapping
function loadDefenseCSV(filePath) {
    const csv = fs.readFileSync(filePath, 'utf-8');
    const lines = csv.trim().split('\n');
    const mapping = {};
    for (const line of lines.slice(1)) { // skip header
        const [team, value] = line.split(',');
        mapping[team] = parseFloat(value);
    }
    return mapping;
}
async function loadAllDefenseMappings() {
    const baseDir = path.join(__dirname, '../data');
    return {
        rb: loadDefenseCSV(path.join(baseDir, 'defenserb.csv')),
        wr: loadDefenseCSV(path.join(baseDir, 'defensewr.csv')),
        qb: loadDefenseCSV(path.join(baseDir, 'defenseqb.csv')),
        te: loadDefenseCSV(path.join(baseDir, 'defensete.csv')),
    };
}
exports.loadAllDefenseMappings = loadAllDefenseMappings;
