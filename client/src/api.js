// export async function listParts() {
//   try {
//     const response = await fetch("http://localhost:8000/listpart");
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching parts:", error.message);
//     throw error;
//   }
// }

export async function listPart(componentType, componentAttribute, searchQuery) {
  try 
  {
    //const url = `http://localhost:8000/listpart?searchQuery=${searchQuery}&componentType=${componentType}&componentAttribute=${componentAttribute}`;
    
    //dynamically add queries to url
    let url = `http://localhost:8000/listpart?`;
    if(componentType){url += `componentType=${componentType}&`;} 
    if(componentAttribute){url += `componentAttribute=${componentAttribute}&`;}
    if(searchQuery){url += `searchQuery=${searchQuery}&`;} 

    const response = await fetch(url);
    console.log('Fetching rows from: ', url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching parts:", error.message);
    throw error;
  }
}



export async function listPreBuilts() {
  try {
    const response = await fetch("http://localhost:8000/listprebuilt");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching prebuilts:", error.message);
    throw error;
  }
}

export async function generatePCBuild(description) {
  try {
    const response = await fetch("http://localhost:8000/generate-pc-build", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const rawOuterResponse = await response.json();
    const pcBuildString = rawOuterResponse.pcBuild;
    const cleanedPcBuildString = pcBuildString
      .replace(/\\n/g, "")
      .replace(/\\"/g, '"');
    const parsedPcBuild = JSON.parse(cleanedPcBuildString).PC_Build;

    return {
      rawOutput: JSON.stringify(rawOuterResponse, null, 2),
      parsedPcBuild,
    };
  } catch (error) {
    console.error("Error generating PC build:", error.message);
    throw error;
  }
}
