/**
 * API Test Script - Run this to verify endpoints work
 * Usage: node test-api.js
 */

async function testAPI() {
  const baseURL = "http://localhost:5000";

  console.log("🧪 Testing Proctoring API...\n");

  // Test 1: Health Check
  try {
    console.log("1️⃣ Health Check");
    const healthRes = await fetch(`${baseURL}/api/health`);
    const healthData = await healthRes.json();
    console.log("   ✅ Status:", healthData.status);
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log();

  // Test 2: Report Event
  try {
    console.log("2️⃣ Report Event (TAB_SWITCH)");
    const eventRes = await fetch(`${baseURL}/api/proctoring-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "TAB_SWITCH",
        timestamp: Date.now(),
      }),
    });
    const eventData = await eventRes.json();
    console.log("   ✅ Response:", eventData.message);
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log();

  // Test 3: Report Multiple Events
  try {
    console.log("3️⃣ Report Multiple Events");
    const events = ["LOOKING_AWAY", "NO_FACE", "MULTIPLE_FACES"];
    for (const event of events) {
      const res = await fetch(`${baseURL}/api/proctoring-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          timestamp: Date.now(),
        }),
      });
      console.log(`   ✅ ${event} recorded`);
    }
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log();

  // Test 4: Get All Events
  try {
    console.log("4️⃣ Retrieve All Events");
    const allRes = await fetch(`${baseURL}/api/proctoring-events`);
    const allData = await allRes.json();
    console.log(`   ✅ Total Events: ${allData.total}`);
    console.log("   Events:");
    allData.events.forEach((e, i) => {
      console.log(
        `     ${i + 1}. ${e.event} (${new Date(e.timestamp).toLocaleString()})`
      );
    });
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log("\n✅ API Tests Complete!\n");
}

testAPI().catch(console.error);
