export async function listParts() {
    try {
      const response = await fetch("http://localhost:8000/listpart");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching parts:", error.message);
      throw error;
    }
  }
  
  