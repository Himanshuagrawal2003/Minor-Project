const testApi = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/mess', {
      method: 'GET'
    });
    const text = await res.text();
    console.log("GET RESPONSE HTTP CODE:", res.status);
    console.log("GET RESPONSE DATA FIRST 100 CHARS:", text.substring(0, 100));
  } catch (err) {
    console.log("GET ERROR:", err.message);
  }
};

testApi();
