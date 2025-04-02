import { Box, Card, CardContent } from '@mui/material';
import '../styles/home.scss';

const WorkspacePage = () => {

  return (
    <Box
      className='pageWrapper'
    >
      <Card
        className='pageCard'
      >
        <CardContent>
          <Box>
            <h2>Workspace</h2>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkspacePage;
