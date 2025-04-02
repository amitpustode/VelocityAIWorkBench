import { Box, Typography, Grid, Paper, Avatar, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CloudIcon from "@mui/icons-material/Cloud";
import CampaignIcon from "@mui/icons-material/Campaign";
import React, { useState } from "react";
import {logEvent} from "../utility/logger"

// Define types for pptdata structure
type UserCase = {
  "Code Review"?: string;
  "Documentation Creation"?: string;
  "Unit Testing"?: string;
  [key: string]: string | undefined;
};

type ValueAdd = {
  "Productivity Improvement"?: string;
  "Quality of Output"?: string;
  [key: string]: string | undefined;
};

type CaseStudyData = {
  Project: string;
  "Tech Stack": string;
  "Team Size": number;
  UserCases: UserCase[];
  ValueAdd: ValueAdd[];
  TeamFeedback: string;
  OverallExperience?: string; // Optional field for some data
};

const pptdata = [
  {
    "Project": "SE Builder",
    "Tech Stack": "AngularJS to Angular 15",
    "Team Size": 6,
    "User Cases": [
      {
        "Migrating the AngularJS code to modern Angular": "N/A"
      },
      {
        "Documentation Creation": "Estimated the time saved and reduced the effort based on CodeBuddy"
      },
      {
        "Unit Testing": "N/A"
      }
    ],
    "Value Add": [
      {
        "Productivity Improvement": "~40% effort saved."
      },
      {
        "Quality of Output": "Helps in migrating the code automatically instead of manually with better code quality."
      },
      {
        "Quality of Output": "Code coverage ~20% and ~50% unit coverage increased the overall maintainability index (including edge cases)"
      }
    ],
    "Team Feedback": "CodeBuddy has helped the team reduce the manual efforts & has saved the time by 15-20%. Looking forward to migrating all the files using the same approach, which will result in saving time & effort and, moreover, will help us to deliver the project on time as committed to the client."
  },
  {
    "Project": "Rent A Centre",
    "Tech Stack": "Ruby on Rails, Kotlin, Elm, Haskell, Python, React",
    "Team Size": 11,
    "User Cases": [
      {
        "Documentation Creation": "We automated the task of generating the Swagger (OpenAPI) specification of ~60 services, which were in multiple programming languages for RAC."
      }
    ],
    "Value Add": [
      {
        "Productivity Improvement": "~15% increase in productivity."
      },
      {
        "Quality of Output": "The entire Swagger documentation generated was clear and concise. With little developer intervention, we were able to generate all the APIs in a few hours, which would have taken a few man-months to complete if it had been done manually."
      }
    ],
    "Team Feedback": "The CodeBuddy team worked cohesively with the RAC team and made sure all the issues were addressed at the root level. There were no challenges, and the entire activity was completed in a couple of interactive meetings. All the improvements and suggestions were openly welcomed and addressed quickly. This helped the RAC team meet its customer deadlines."
  }
];

const CaseStudy = () => {
  const [currentIndex, setCurrentIndex] = useState<any>(0);
  logEvent("info", "Case Study component loaded.");

  const handleNext = () => {
    if (currentIndex < pptdata.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentCase:any = pptdata[currentIndex];

  console.log(currentCase);

  return (
    <Box sx={{ height:"100vh", padding: "2em 2em 2em 2em", backgroundColor: "#f5f5f5" }}>
      <Grid container spacing={4}>
        {/* Left Section */}
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={4}
            sx={{
              backgroundColor: "rgba(243, 113, 55, 1)",
              color: "white",
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                textAlign: "left",
                color: "#ffffff",
              }}
            >
              CASE STUDY
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                mb: 2,
                textAlign: "left",
              }}
            >
              Project: {currentCase.Project}
            </Typography>
            <Typography>
              Tech Stack: {currentCase["Tech Stack"]}<br />
              Team Size: {currentCase["Team Size"]}<br />
              The project has been launched. The first batch of products is expected to be released at the end of the month. Several contracts have been signed that allow the production capacity to be loaded within 3-4 months.
            </Typography>
          </Paper>
        </Grid>

        {/* Right Section */}
        <Grid item xs={12} sm={8}>
          <Grid container spacing={3}>
            {/* The Problem */}
            <Grid item xs={12}>
              <Paper
                elevation={4}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 3,
                  backgroundColor: "#1abc9c",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: "white",
                    color: "#1abc9c",
                    mr: 2,
                  }}
                >
                  <StarIcon />
                </Avatar>
                <Box style={{ paddingLeft: "10px" }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    User Cases
                  </Typography>
                  <Typography>
                    <ul style={{ margin: "0px", padding: "0px" }}>
                      {currentCase["User Cases"].map((userCase:any, index:any) => (
                        <li key={index}>
                          {Object.entries(userCase).map(([key, value]:any) => (
                            <div key={key}>
                              <strong>{key}:</strong> {value}
                            </div>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* The Solution */}
            <Grid item xs={12}>
              <Paper
                elevation={4}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 3,
                  backgroundColor: "#1abc9c",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: "white",
                    color: "#1abc9c",
                    mr: 2,
                  }}
                >
                  <CloudIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Value Add
                  </Typography>
                  <Typography>
                    {currentCase["Value Add"].map((value:any, index:any) => (
                      <div key={index}>
                        {Object.entries(value).map(([key, val]:any) => (
                          <div key={key}>
                            <strong>{key}:</strong> {val}
                          </div>
                        ))}
                      </div>
                    ))}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* The Results */}
            <Grid item xs={12}>
              <Paper
                elevation={4}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 3,
                  backgroundColor: "#1abc9c",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: "white",
                    color: "#1abc9c",
                    mr: 2,
                  }}
                >
                  <CampaignIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Team Feedback
                  </Typography>
                  <Typography>
                    {currentCase['Team Feedback']}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

        </Grid>
      </Grid>
      {/* Navigation Buttons */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              className="secondary-btn"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              className="secondary-btn"
              onClick={handleNext}
              disabled={currentIndex === pptdata.length - 1}
              sx={{ ml: 2 }}
            >
              Next
            </Button>
          </Box>
    </Box>
  );
};

export default CaseStudy;
