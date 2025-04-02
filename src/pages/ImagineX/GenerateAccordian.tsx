import React, { useState, useEffect, useRef } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextareaAutosize,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import mermaid from 'mermaid';
import { encode } from 'plantuml-encoder';
import domtoimage from 'dom-to-image-more';
import { getPromptResponses } from '@/services/imaginexService';
import Markdown from 'react-markdown';

type AccordionItemProps = {
  index: number;
  title: string;
  code: string;
  frameworkName: string;
  language: string;
};

type DiagramState = {
  isLoading: boolean;
  code: string;
  diagramUrl: string | null;
  purpose: string | null;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ index, title, code, frameworkName, language }) => {
  const [diagramState, setDiagramState] = useState<DiagramState>({
    isLoading: false,
    code,
    diagramUrl: null,
    purpose: null,
  });

  const [viewMode, setViewMode] = useState<'code' | 'diagram' | 'explanation'>('diagram');
  const [anchorEl, setAnchorEl] = useState(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (code) {
      generateDiagram(code, frameworkName);
      generatePurpose(code, language, frameworkName);
    }
  }, [code, frameworkName, index]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      pie: { useWidth: 400 },
    });
  }, []);

  const generateDiagram = async (code:any, frameworkName:any) => {
    console.log('Generating diagram with framework:', frameworkName);
    console.log('Code provided:', code);

    if (!code.trim()) {
      console.error('No code provided for diagram generation.');
      setDiagramState((prevState) => ({
        ...prevState,
        purpose: 'Error: No code provided for diagram generation.',
      }));
      return;
    }

    setDiagramState((prevState) => ({ ...prevState, isLoading: true }));

    try {
      let url: string | null = null;

      if (frameworkName.toLowerCase() === 'plantuml') {
        url = await generatePlantDiagram(code);
      } else if (isMermaidCodeValid(code)) {
        url = await drawMermaidDiagram(code);
      } else {
        throw new Error('Unsupported framework or invalid code');
      }

      setDiagramState((prevState) => ({
        ...prevState,
        isLoading: false,
        diagramUrl: url,
      }));
    } catch (error) {
      console.error('Error generating diagram:', error);
      setDiagramState((prevState) => ({
        ...prevState,
        isLoading: false,
        diagramUrl: null,
        purpose: 'Error generating diagram. Please check the syntax or framework.',
      }));
      throw new Error('Unsupported framework');
    }
  };

  const generatePlantDiagram = async (code: string): Promise<string> => {
    if (!code.trim()) {
      throw new Error('No code to generate diagram.');
    }
  
    const encodedData = encode(diagramState.code);
  
    // Generate the PlantUML diagram URL
    const encodedURL = `https://www.plantuml.com/plantuml/svg/${encodedData}`;

    console.log('encoded URL',encodedURL);
  
    // Check if the URL is valid by sending a HEAD request
    const response = await fetch(encodedURL, { method: 'HEAD' });
    if (response.ok) {
      return encodedURL;
    } else {
      throw new Error('Failed to fetch PlantUML diagram.');
    }
  };

  const drawMermaidDiagram = async (code: string): Promise<string> => {
    try {
      const { svg } = await mermaid.render(`diagramSvg_${index}`, code);
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      throw new Error('Failed to render Mermaid diagram.');
    }
  };

  const isMermaidCodeValid = (code: string): boolean => {
    const validTypes = ['graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'flowchart', 'erDiagram', 'pie'];
    return validTypes.some((type) => code.trim().startsWith(type));
  };

  const getPurposePromptsResponses = async (code: string, purposeLanguage: string, frameworkName: string) => {
    const prompts = [
      {
        role: 'system',
        content: `Act like a technical writer and explain the purpose of this diagram code created using ${frameworkName} in ${purposeLanguage}. Format the response as inner HTML wrapped in a <div> tag.`,
      },
      {
        role: 'user',
        content: `Purpose of the given diagram script generated for ${frameworkName}: ${code}`,
      },
    ];

    return await getPromptResponses(prompts);
  };

  const generatePurpose = async (code: string, purposeLanguage: string, frameworkName: string) => {
    try {
      const purpose = await getPurposePromptsResponses(code, purposeLanguage, frameworkName);
      setDiagramState((prevState) => ({ ...prevState, purpose }));
    } catch (error) {
      console.error('Error generating purpose:', error);
      setDiagramState((prevState) => ({
        ...prevState,
        purpose: 'Error generating purpose. Please check the input or try again.',
      }));
    }
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = event.target.value;

    console.log(newCode);

    setDiagramState((prevState) => ({
      ...prevState,
      code: newCode,
    }));
    
  };

  const convertSvgToInline = async () => {
    const imgElement:any = document.querySelector('img');
    if (!imgElement || !imgElement.src) return;

    const response = await fetch(imgElement.src);
    const svgText = await response.text();

    const svgElement = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
    svgElement.setAttribute('width', imgElement.width);
    svgElement.setAttribute('height', imgElement.height);

    imgElement.replaceWith(svgElement);
  };

  
  const handleExport = async (format: 'png' | 'jpeg') => {
    if (!diagramRef.current) {
        console.error('Diagram not found for export.');
        return;
    }

    await convertSvgToInline(); // Ensure the SVG is inline before exporting

    try {
        const scale = 10; 
        const { offsetWidth, offsetHeight } = diagramRef.current;
        
        const options = {
            width: offsetWidth * scale,
            height: offsetHeight * scale,
            style: {
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${offsetWidth}px`,
                height: `${offsetHeight}px`
            },
            bgcolor: format === 'jpeg' ? '#ffffff' : undefined 
        };

        let dataUrl;
        if (format === 'png') {
            dataUrl = await domtoimage.toPng(diagramRef.current, options);
        } else if (format === 'jpeg') {
            dataUrl = await domtoimage.toJpeg(diagramRef.current, options);
        } else {
            console.error('Unsupported format:', format);
            return;
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `diagram.${format}`; 
        link.click();
    } catch (error) {
        console.error('Error exporting diagram:', error);
    }
  };

  const handleMenuOpen = (event:any) => setAnchorEl(event.currentTarget);
  const handleMenuClose = (format:any) => {
    setAnchorEl(null);
    if (format) handleExport(format); // Call the export function with format 'png' or 'jpeg'
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`accordion-header-${index}`}>
        <h4 style={{margin:"0px"}}>{title}</h4>
      </AccordionSummary>
      <AccordionDetails>
        {diagramState.isLoading && (
          <div ref={overlayRef}>
            <p>Loading diagram...</p>
          </div>
        )}

        {viewMode === 'code' && (
          <TextareaAutosize
            ref={codeTextareaRef}
            value={diagramState.code}
            onChange={handleCodeChange}
            minRows={3}
            style={{
              width: '100%',
              marginBottom: '1em',
              background: '#000',
              color: '#fff',
              outline: 'none',
            }}
          />
        )}

        {viewMode === 'diagram' && diagramState.diagramUrl && (
          <div ref={diagramRef} style={{ width:"900px", textAlign: 'left', marginBottom: '1em' }}>
            <img
              src={diagramState.diagramUrl}
              alt="Diagram Preview"
              style={{ width: '100%' }}
            />
          </div>
        )}

        {viewMode === 'explanation' && diagramState.purpose && (
            <Box>
              <span
                      dangerouslySetInnerHTML={{
                        __html: diagramState.purpose
                      }}
                    ></span>

              
            </Box>  
        )}

        <div>
          <Button variant="outlined" onClick={() => setViewMode('code')} style={{ marginRight: '8px' }}>
            Code
          </Button>
          <Button variant="outlined" onClick={() => {
            generateDiagram(diagramState.code, frameworkName);
            setViewMode('diagram');
          } } style={{ marginRight: '8px' }}>
            View
          </Button>
          <Button variant="outlined" onClick={() => setViewMode('explanation')} style={{ marginRight: '8px' }}>
            Explanation
          </Button>
          {viewMode === 'diagram' && 
          <>
            <Button variant="outlined" onClick={() => generateDiagram(code, frameworkName)} style={{ marginRight: '8px' }}>
              Regenerate Diagram
            </Button>
            <Button variant="outlined" onClick={handleMenuOpen}>
              Export
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => handleMenuClose(null)}
            >
              <MenuItem onClick={() => handleMenuClose('png')}>Export as PNG</MenuItem>
              <MenuItem onClick={() => handleMenuClose('jpeg')}>Export as JPEG</MenuItem>
            </Menu>
          </>
          }
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

const generateAccordion = (data: any[], language: any) => (
  <div id="accordion-wrapper">
    {data.map((ele, index) =>
      Object.entries(ele).map(([key, value]: any) => (
        <AccordionItem
          key={index}
          index={index}
          title={key}
          code={value[0]}
          frameworkName={value[1]}
          language={language}
        />
      ))
    )}
  </div>
);

export default generateAccordion;
