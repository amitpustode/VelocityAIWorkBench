
const projectKey = import.meta.env.VITE_JIRA_PROJECT_KEY;
const requirements_confing = 'EMBEDDING';

export async function getPromptsResponses(form: any, localLLM: any,  uploadImage: any) {
  let { userInput, codeFile, language, epic_type, llmmodel, radioOption, reqFile } = form;
     if (requirements_confing === 'EMBEDDING') {
        console.log("Sending messages to Electron:", form);
        

        if (!language || !epic_type) {
            const missingFields = [];

            if (!language) missingFields.push('language');
            if (!epic_type) missingFields.push('epic_type');

            console.log("Missing required fields in the request payload.", userInput, language, epic_type);
            throw new Error(`Missing required fields in the request payload: ${missingFields.join(', ')}. Values -language: ${language}, epic_type: ${epic_type}`);
        }

        try {
            const response = await window.electronAPI.getBravoEmbeddingsResponses(form);
            if (response) {
                let answer = response;
                console.log(answer);
                return answer;
            }
        } catch (error) {
            console.error("Error invoking Electron API:", error);
            throw new Error("Failed to fetch data from Electron API.");
        }
        return;
    } 

    console.log(form);
    console.log(uploadImage);

    let userPrompt = {};
    let systemPrompt = {};
    
    let promptInput;

    if (userInput !== null) {
        promptInput = userInput;
    }

    userPrompt = {
        "role": "user",
        "content": `Create list of possible \"${epic_type}\" to be generated for the requirement \"${promptInput}\" the detailed requirements as much as possible in a tabular format as Epic id’ | ‘Title’ | Description’ | EPIC TYPE’.  ‘Title’  should be a short description of the epic under 20 words in ${language}. format: JSON`
    };
    systemPrompt = {
        "role": "system",
        "content": `Act like a product owner and you are expert in defining EPICs and User Stories for each EPIC as per Scrum Practices. Your job is to define the detailed requirements as much as possible for prepare a Table using JSON data format.Please share the output in valid JSON Format without comments. Example JSON => {\n  \"EPIC\": [\n    {\"epic_id\":\"Epic id\",\"epic_title\":\"Epic Title\",\"epic_description\":\"Epic Description\",\"epic_type\":\"Epic Type\"}\n  ]\n}`
    };

    if (localLLM) {
        userPrompt = {
            "role": "user",
            "content": `provide valid JSON output to Create list of possible \"${epic_type}\" to be generated for the requirement \"${promptInput}\" the detailed requirements as much as possible in a tabular format as Epic id’ | ‘Title’ | Description’ | EPIC TYPE’. Response should be in ${language} in valid JSON.`
        };
    }

    const prompts = [systemPrompt, userPrompt];

    if (localLLM) {
        return prompts;
    }

    let response: any;
    try {
        response = await getPromptResponses(prompts);
    } catch (error) {
        console.error("Error getting prompt responses:", error);
        throw error;
    }

    return response;
}

export async function getSrories(
  epic: any,
  storyType: any,
  language: any,
  considerEmbedding: boolean
  ){

    try{
      const formData = new FormData();

      //story_type is a list of strings. convert it to string 
      //let types = storyType.join(',');

      const payload = {
        story_type: storyType,
        language: language,
        epic: epic,
        considerEmbedding: considerEmbedding
      }

      let response = await window.electronAPI.getBravoEmbeddingsStories(payload);
     
      console.log(response)
      let objectResponse;
      if (response.search("```") > -1) {
        response = JSON.parse(response.split("```")[1].substring(4));
      } else if (response[0] == '{') {
      objectResponse = JSON.parse(response);
      if (Array.isArray(objectResponse)) {
        // console.log("ObjectResp:",objectResponse);
        return objectResponse;

    } else if (objectResponse.story.length) {
        console.log("ObjectRes:", objectResponse);
        // console.log("ObjectRes:",objectResponse.diagrams);
        return objectResponse.story;

    } else {
      response = [];
    }
    } else {
      response = [];
    }
    return response;

      
    }
    catch(error){
        console.error("Error getting prompt responses:", error);
        throw new Error("Failed to get prompt responses.");
    }

  }

export async function getStoryPrompts(
    epic: any,
    storyType: any,
    language: any,
    localLLM: any
  ) {

    let userPrompt = {};
  let systemPrompt = {};

  if(localLLM){
    userPrompt = {
    "role": "user",
    "content": `Create a table with list of possible ${storyType} of given Epic Id ${epic.epic_id} Epic title ${epic.epic_title} and Epic description \"${epic.epic_description}"\ to be generated as much as possible in a tabular format as 'Epic id’ | 'Epic Title' | 'Story ID' | 'Story Title’ | 'Story Desciption' | 'Primary Persona' | 'Acceptance Criteria' | 'Suggestive Business Domain Name' |'T-Size' | 'Complexity'.  'Story Title' in (20 words), 'Story Desciption' in (50 words),  in ${language}. Provide the response in well formatted html <table> with css styling in tabular format.`
    }
    systemPrompt = {
    "role": "system",
    "content": `Act like an architect and you are expert in developing digital platforms and you have brilliant skills in defining the ${storyType}.  Your job is to define the detailed ${storyType} as much as possible for the given epic description \"${epic.epic_description}"\ for prepare a Table using JSON data format.Please share the output in valid JSON Format without comments. Example JSON => [\n  {\"epic_id\":\"Epic id\",\"epic_title\":\"Epic Title\",\"story_id\":\"Story ID\",\"story_title\":\"Story Title\",\"story_desc\":\"Story Desciption\",\"primary_persona\":\"Primary Persona\",\"acceptance_crit\":\"Acceptance Criteria\",\"business_domain\":\"Suggestive Business Domain Name\",\"t_size\":\"Task-Size\",\"complexity\":\"Complexity\"}\n  ]"
    Strictly use this EPIC for Story Generation: ${epic}.Provide the response in well formatted html <table> with css styling in tabular format.
    `
  }
  }else{
    userPrompt = {
    "role": "user",
    "content": `Create list of possible ${storyType} of given Epic Id ${epic.epic_id} Epic title ${epic.epic_title} and Epic description \"${epic.epic_description}"\ to be generated as much as possible in a tabular format as 'Epic id’ | 'Epic Title' | 'Story ID' | 'Story Title’ | 'Story Desciption' | 'Primary Persona' | 'Acceptance Criteria' | 'Suggestive Business Domain Name' |'T-Size' | 'Complexity'.  'Story Title' in (20 words), 'Story Desciption' in (50 words),  in ${language}. format: JSON`
  }
  systemPrompt = {
    "role": "system",
    "content": `Act like an architect and you are expert in developing digital platforms and you have brilliant skills in defining the ${storyType}.  Your job is to define the detailed ${storyType} as much as possible for the given epic description \"${epic.epic_description}"\ for prepare a Table using JSON data format.Please share the output in valid JSON Format without comments. Example JSON => {\n  \"story\": [\n  {\"epic_id\":\"Epic id\",\"epic_title\":\"Epic Title\",\"story_id\":\"Story ID\",\"story_title\":\"Story Title\",\"story_desc\":\"Story Desciption\",\"primary_persona\":\"Primary Persona\",\"acceptance_crit\":\"Acceptance Criteria\",\"business_domain\":\"Suggestive Business Domain Name\",\"t_size\":\"Task-Size\",\"complexity\":\"Complexity\"}\n  ]\n}"
    Strictly use this EPIC for Story Generation: ${epic}
    `
  }
  }

  
  

  const prompts = [systemPrompt, userPrompt];
  if(localLLM){
    return prompts
  }
  let response = await getPromptResponses(prompts); // Ensure you await the response

  let objectResponse;
  if (response.search("```") > -1) {
    response = JSON.parse(response.split("```")[1].substring(4));
  } else if (response[0] == '{') {
    objectResponse = JSON.parse(response);
    if (Array.isArray(objectResponse)) {
      // console.log("ObjectResp:",objectResponse);
      return objectResponse;

    } else if (objectResponse.story.length) {
      console.log("ObjectRes:", objectResponse);
      // console.log("ObjectRes:",objectResponse.diagrams);
      return objectResponse.story;

    } else {
      response = [];
    }
  } else {
    response = [];
  }
  return response;
    
}
  
  

export async function getPromptResponses(messages: any):Promise<any> {
    try {
      console.log("Sending messages to Electron:", messages);
  
      // Invoke Electron API
      const response:any = await window.electronAPI.getBravoPromptResponses(messages);
  
      console.log("Response received from Electron:", response);
  
      // Validate and return the response
      if (response) {
        let answer = response.choices[0].message.content.trim();
        console.log(answer);
        return answer;
      }
  
      throw new Error("Invalid response format received from Electron API.");
    } catch (error: any) {
      console.error("Error calling Electron function:", error.message);
      throw error;
    }
  }
  
  export async function jiraCreationPost(selectedEpics: any) {
    const epicResponses = [];
    for (const epic of selectedEpics) {
        const epicData = {
            "fields": {
                "project": { "key": projectKey },
                "issuetype": { "name": "Epic" },
                "summary": epic.epic_title,
                "customfield_10011": epic.epic_description, // Adjust for your Epic Name field ID
            },
        };

        try {
            // Package payload for electronAPI
            const payload = {
                epicdata: epicData, 
            };

            // Call window.electronAPI with well-structured data
            const response = await window.electronAPI.pushEpicToJira(payload);
            epic['jira_issue_id']=response.key;
            epic['jira_issue_link']=`https://globallogic-velocity.atlassian.net/browse/${response.key }`;
            epic['jira_status']="success";
            epicResponses.push(epic);
        } catch (error:any) {
            let jiraerror = 'Error pushing epic to Jira, check jira permissions';
            console.error(`Error pushing epic to Jira:`, error);
            epicResponses.push({
                status: 'error',
                title: epic.epic_title,
                error: jiraerror || error,
            });
        }
    }
    return epicResponses; // Aggregate results for client-side handling
}

export async function pushStorytojira(selectedStories: any) {
  const storyResponses = [];
  for (const story of selectedStories) {
      
      try {
          // Package payload for electronAPI
          const payload = {
            projectKey: projectKey,
            storyData: story 
          };

          // Call window.electronAPI with well-structured data
          const response = await window.electronAPI.pushStoryToJira(payload);
          storyResponses.push({ status: 'success', data: response });
      } catch (error:any) {
          console.error(`Error pushing story to Jira:`, error);
          storyResponses.push({
              status: 'error',
              title: story.story_title,
              error: error.message || error,
          });
      }
  }
  return storyResponses; // Aggregate results for client-side handling
}

