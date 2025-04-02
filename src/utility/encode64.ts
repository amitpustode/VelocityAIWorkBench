export const encode64 = (data: Uint8Array): string => {
    const base64Table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let output = "";
    let buffer: number[] = [];
  
    for (let i = 0; i < data.length; i++) {
      buffer.push(data[i]);
  
      if (buffer.length === 3 || i === data.length - 1) {
        const [b1, b2, b3] = buffer;
        
        output += base64Table[b1 >> 2]; // First 6 bits of b1
        output += base64Table[(b1 & 0b11) << 4 | (b2 >> 4 || 0)]; // Remaining 2 bits of b1 and top 4 bits of b2
        output += b2 !== undefined ? base64Table[(b2 & 0b1111) << 2 | (b3 >> 6 || 0)] : "-"; // Bottom 4 bits of b2 and top 2 bits of b3
        output += b3 !== undefined ? base64Table[b3 & 0b111111] : "-"; // Bottom 6 bits of b3
  
        buffer = [];
      }
    }
  
    return output;
};
