import { createSlice } from '@reduxjs/toolkit';

export interface AppState {
  loading: boolean;
}

const appSlice = createSlice({
  name: 'app',
  initialState: { 
    loading: false,
    fileUpload: {},
    showAppBar: false,
    appFont:'',
    pageTitle: '',
    logo:'',
    profilePhoto:'',
    nickName:'',
    pageHeaderTooltip: '',
    defaultAIProvider: '',
    menu: [{
      "name": "Home",
      "header": "Home",
      "enabled": true,
      "link": "/"
    },
    {
      "name": "Knowledge Hub",
      "header": "Knowledge Hub",
      "enabled": true,
      "submenu": [
        {
          "name": "Knowledge Hub Dashboard",
          "header": "Knowledge Hub Dashboard",
          "enabled": true,
          "link": "https://script.google.com/a/macros/globallogic.com/s/AKfycbwL-FW1ocZl36pJ13DFfbv5HY01WAJPZN38u-Ndkq1ns8po3CNRZazJQ8OrT3I6z_KLBg/exec"
        },
        {
          "name": "M2C1 Templates",
          "header": "M2C1 Templates",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Estimators",
          "header": "Estimators",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "LLM Cost Calculator",
          "header": "LLM Cost Calculator",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Sample Proposal",
          "header": "Sample Proposal",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Legal & Compliance",
          "header": "Legal & Compliance",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Security Reports",
          "header": "Security Reports",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Training Videos",
          "header": "Training Videos",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Documentation",
          "header": "Documentation",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Tutorials and How-To Guides",
          "header": "Tutorials and How-To Guides",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "FAQ",
          "header": "FAQ",
          "enabled": true,
          "link": "/underconstruction"
        }
      ]
    },
    {
      "name": "Sales Enablement",
      "header": "Sales Enablement",
      "enabled": true,
      "submenu": [
        {
          "name": "Sales Enablement Dashboard",
          "header": "Sales Enablement Dashboard",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Biz Canvas",
          "header": "Biz Canvas",
          "enabled": true,
          "link": `https://script.google.com/a/macros/globallogic.com/s/AKfycbxIGpTxGx2emOeuR_DBqYoeEzmpVYCtdI4xZUZ6wSjGQ_Sab7ZLuZCGE-9o_4mgl1A/exec`
        },
        {
          "name": "Profile Pro",
          "header": "Profile Pro",
          "enabled": true,
          "link": `https://script.google.com/a/macros/globallogic.com/s/AKfycbwsANJC89KglyfUVYEhbeC6HKPvmkP4HzFsFPd-4p6sYlnC2N6bM47n2JERRbyku90rMA/exec`
        },
        {
          "name": "Proposal Pro",
          "header": "Proposal Pro",
          "enabled": true,
          "link": "http://proposalpro.globallogic.com/"
        }
      ]
    },
    {
      "name": "Dx Advisory",
      "header": "AI Assisted Digital Transformation Advisory",
      "enabled": true,
      "submenu": [
        {
          "name": "Dx Advisor",
          "header": "GenAI Assistance in Advisory",
          "enabled": true,
          "link": "/underconstruction"
        }
      ]
    },
    {
      "name": "Project/Program Mgmt",
      "header": "Project/Program Mgmt",
      "enabled": true,
      "submenu": [
        {
          "name": "Project/Program Mgmt Dashboard",
          "header": "Project/Program Mgmt Dashboard",
          "enabled": true,
          "link": "/underconstruction"
        }
      ]
    },
    {
      "name": "SDLC",
      "header": "SDLC",
      "enabled": true,
      "submenu": [
        {
          "name": "SDLC Map",
          "header": "Landing Page showing SDLC Map",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Experience Design",
          "header": "Visualize Your Architecture in Style",
          "enabled": true,
          "link": "/imaginex"
        },
        {
          "name": "Requirements Mgmt",
          "header": "GenAI Assistance in Generating Business Requirements",
          "enabled": true,
          "link": "/bravo"
        },
        {
          "name": "Link to documents",
          "header": "Link to documents",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "CodeBuddy",
          "header": "AI Assisted Software Development",
          "enabled": true,
          "link": "/codebuddy"
        },
        {

          "name": "QaCompanion",
          "header": "STLC Workbench",
          "enabled": true,
          "link": "/qacompanion"
        },
      ]
    },
    {
      "name": "STLC",
      "header": "STLC",
      "enabled": true,
      "submenu": [
        {
          "name": "STLC Map",
          "header": "Landing Page showing STLC Map",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Test Plan",
          "header": "Test Plan",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "QaCompanion",
          "header": "Gen AI Assistance For Quality Teams Throughout STLC",
          "enabled": true,
          "link": `http://172.30.102.86:3003/`
        },
        {
          "name": "ScaleQA",
          "header": "Deploy and Execute Testing Enviornment With ScaleQA",
          "enabled": true,
          "link": "http://172.30.111.51:30004/ui/#login"
        },
        {
          "name": "MockMagic",
          "header": "MockMagic",
          "enabled": true,
          "link": `https://docs.google.com/presentation/d/1Y5pM50kZiYjUQ4Krlj-Wj22lyXTJJDiFeP8JurNLJSE/preview`
        },
        {
          "name": "CoEqual",
          "header": "CoEqual",
          "enabled": true,
          "link": `https://docs.google.com/presentation/d/1Y5pM50kZiYjUQ4Krlj-Wj22lyXTJJDiFeP8JurNLJSE/preview`
        }
      ]
    },
    {
      "name": "Insights & Reporting",
      "header": "Insights & Reporting",
      "enabled": true,
      "submenu": [
        {
          "name": "Bug Hunter",
          "header": "Bug Hunter",
          "enabled": true,
          "link": "/bugHunter"
        },
        {
          "name": "Developer Velocity",
          "header": "Developer Velocity",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Deployment Frequency",
          "header": "Deployment Frequency",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Defect Density",
          "header": "Defect Density",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "Performance",
          "header": "Performance",
          "enabled": true,
          "link": "/underconstruction"
        },
        {
          "name": "List of projects",
          "header": "List of projects",
          "enabled": true,
          "link": "/underconstruction"
        }
      ]
    }
  ],
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setFileUpload: (state, action) => {
      state.fileUpload = action.payload;
    },
    toggleAppBar: (state) => {
      state.showAppBar = !state.showAppBar;
    },
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },
    setHeaderTooltip: (state, action) => {
      state.pageHeaderTooltip = action.payload;
    },
    setDefaultAIProvider: (state, action) => {
      state.defaultAIProvider = action.payload;
    },
    setLogo: (state, action) => {
      state.logo = action.payload;
    },
    setProfilePhoto: (state, action) => {
      state.profilePhoto = action.payload;
    },
    setNickName: (state, action) => {
      state.nickName = action.payload;
    },
    setAppFont: (state, action) => {
      state.appFont = action.payload;
    },
    toggleMenu: (state, action) => {
      const { path, enabled } = action.payload;
      console.log(path, enabled);
      // Function to recursively find and update the menu or submenu item
      const updateMenu = (items:any) => {
        for (let item of items) {
          if (item.name === path[0]) {
            if (path.length === 1) {
              item.enabled = enabled;
              console.log(item);
            } else if (item.submenu) {
              updateMenu(item.submenu);
              console.log(item);
            }
            break;
          }
        }
      };

      updateMenu(state.menu);
    },
  },
});

export const { setLoading, 
               setFileUpload,
               toggleAppBar,
               toggleMenu,
               setPageTitle,
               setHeaderTooltip,
               setDefaultAIProvider,
               setLogo,
               setProfilePhoto,
               setNickName,
               setAppFont,
             } = appSlice.actions;
export default appSlice.reducer;
