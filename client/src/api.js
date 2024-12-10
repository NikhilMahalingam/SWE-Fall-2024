export async function listParts() {
    const data = await fetch("http://localhost:8000/listpart");
    console.log(data);
    return data;
}