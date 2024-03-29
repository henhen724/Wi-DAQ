import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { getErrorMessage } from '../errorFormatting';
import { CircularProgress } from '@material-ui/core';

import BrightnessIcon from './brightnessIcon';
import DashboardIcon from './dashboardIcon';
import NotificationBell from './notificationBell';
import UserAvatar from './userAvatar';

const NavViewerQuery = gql`
  query NavViewerQuery {
    viewer {
        _id
        email
    }
  }
`

export default function userProfileMenu() {
    const { data: viewerData, loading, error } = useQuery(NavViewerQuery);

    if (loading) {
        return (<>
            <BrightnessIcon />
            <CircularProgress />
        </>)
    } else if (error) {
        console.error(error);
        return (<h1>PROFILE ERROR:{getErrorMessage(error)}</h1>);
    } else if (!viewerData.viewer) {
        return (<>
            <BrightnessIcon />
            <UserAvatar />
        </>);
    } else {
        return (<>

            <BrightnessIcon />
            <DashboardIcon />
            <NotificationBell />
            <UserAvatar email={viewerData.viewer.email} />
        </>);
    }
}