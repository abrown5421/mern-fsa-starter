import { TrianglifyConfig } from "./types";

export const generateRandomTrianglifyBanner = (): TrianglifyConfig => {
  const colorPalettes = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    ['#A8E6CF', '#DCEDC1', '#FFD3B6'],
    ['#FF8B94', '#FFAAA5', '#FFD3B6'],
    ['#98D8C8', '#F6CD61', '#FE8A71'],
    ['#5F4B8B', '#A390BC', '#E69A8D'],
    ['#00B4D8', '#0077B6', '#03045E'],
    ['#FF006E', '#FB5607', '#FFBE0B'],
  ];
  
  const randomPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  
  return {
    cellSize: Math.floor(Math.random() * 100) + 50,
    variance: Math.random() * 0.75 + 0.25,
    xColors: randomPalette,
    yColors: randomPalette,
    seed: Math.random().toString(36).substring(7),
    strokeWidth: Math.random() * 2,
  };
};
