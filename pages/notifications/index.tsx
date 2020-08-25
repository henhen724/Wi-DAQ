import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';
import gql from 'graphql-tag';
import { CircularProgress, Container, List, ListItem, ListItemText } from '@material-ui/core';
import { INotification } from '../../models/Notification';

const NotificationsQuery = gql`
query NotificationQuery{
    notifications{
        id,
        name,
        topic,
        message,
        mqttMessage,
        recieved,
        viewed,
    }
}
`
interface notoQueryRslt {
    notifications: INotification[]
}


const notficationList = () => {
    const { data, loading, error } = useQuery<notoQueryRslt>(NotificationsQuery);
    if (loading) {
        return (<Container maxWidth="sm"><h1>Loading Notifications</h1><CircularProgress /></ Container>);
    }
    else if (data) {
        const notficationList = data.notifications.map(notofication => {
            return (<Link href={`/notifications/${notofication.id}`}><ListItem>
                <ListItemText primary={notofication.name} secondary={notofication.message} />
            </ListItem></Link>)
        });
        return (<Container maxWidth="sm"><List>
            {notficationList}
        </List></Container>);
    } else {
        return (<Container maxWidth="sm"><h1>An error has occured</h1>{error}</ Container>);
    }
}

export default notficationList;