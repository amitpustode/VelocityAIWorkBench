import { useLocation } from 'react-router-dom';
import { Box, Card, CardContent } from '@mui/material';import '../styles/addworkspace.scss';
import { useEffect } from 'react';
import { setPageTitle, setHeaderTooltip } from "../redux/slices/appSlice";
import { useDispatch } from 'react-redux';
import { logEvent } from '@/utility/logger';

const AddWorkspacePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Retrieve query parameters
  const header = params.get('header');

  useEffect(() => {
    dispatch(setPageTitle(header));
    dispatch(setHeaderTooltip('Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843'));
    logEvent(`info`,`${header} screen loaded.`);
  },[header]);

  return (
    <Box
      className='pageWrapper'
    >
      <Card
        className='pageCard'
      >
          <CardContent>
            <Box style={{display:"flex", alignItems:'center', justifyContent: 'center', height: '80vh'}}>
                <h1>{header}</h1>
            </Box>
            </CardContent>
      </Card>
    </Box>
  );
};

export default AddWorkspacePage;
