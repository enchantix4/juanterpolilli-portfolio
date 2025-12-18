// Test script to check what positions are in localStorage
// This will help us understand the difference between Cursor browser and localhost
console.log("Checking localStorage positions...");
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('heroImagePositions');
  if (saved) {
    console.log("Saved positions:", JSON.parse(saved));
  } else {
    console.log("No saved positions found");
  }
}
