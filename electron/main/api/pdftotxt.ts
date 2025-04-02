import { ipcMain, app } from 'electron';
import fs from 'fs';
import pdfreader from "pdf-parse";

const extractTextFromPDF = (pdfBuffer:any) => {
    console.log(pdfBuffer);
    return new Promise((resolve, reject) => {
        pdfreader(pdfBuffer).then(function(data:any) {
        console.log('utext',data);
        resolve(data.pageData);
      }).catch(function(error:any) {
        reject(error);
      });
    });
  };

export const pdftotexthandlers = () => {

    ipcMain.handle('pdf-to-text', async (_, filebuffer) => {
      console.log(filebuffer);
      try {
        
        const dataBuffer = new Uint8Array(filebuffer);
        const pdfData = Buffer.from(dataBuffer);

        console.log(dataBuffer);

        const pdfText = await extractTextFromPDF(pdfData);

        console.log(pdfText);
        
        return pdfText;
      } catch (error) {
        console.error('Error saving files:', error);
        throw error;
      }
    });
  
  };