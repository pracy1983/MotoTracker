const readBlob = async (blob: Blob): Promise<any> => {
  return new Promise((resolve, reject) => {
    let blobReader = new FileReader();
    blobReader.onload = function () {
      if (blobReader.result !== null) {
        const parsedData = JSON.parse(blobReader.result as string);
        resolve(parsedData);
      } else {
        reject(new Error("Failed to read blob."));
      }
    };
    blobReader.onerror = function () {
      reject(new Error("Error reading the blob."));
    };
    blobReader.readAsText(blob);
  });
};

export default readBlob;