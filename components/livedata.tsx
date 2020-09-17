import gql from 'graphql-tag';
import { useState, useEffect } from 'react';
import { useSubscription, useMutation, useQuery } from '@apollo/react-hooks';
import { getErrorMessage } from './errorFormating';
import { UnionPanelSettings, UnionPanelProps, getPanelFromProps } from './Panel';


const DataQuery = gql`
query DataQuery($topic:String!) {
    topicBuffer(topic:$topic) {
        data
    }
}
`

interface QRslt {
    topicBuffer: { data: Object }[]
}

const DataSubscription = gql`
subscription getData($topicList: [String]!) {
  mqttTopics(topics: $topicList) {
      data
  }
}
`

interface SubRslt {
    mqttTopics: { data: Object }
}

const SendMqttPacket = gql`
mutation sendData($topic:String!, $payload:JSON){
  mqttPublish(input:{topic:$topic, payload:$payload}) {
    success
  }
}
`

interface DashboardProps {
    dataElements: UnionPanelSettings[],
}

interface DataByTopic {
    [key: string]: Object[]
}

const livedata = (props: DashboardProps) => {
    const [data, setData] = useState<DataByTopic>({});
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [mqttPublish] = useMutation(SendMqttPacket);
    const allTopics = props.dataElements.reduce<string[]>((prevTopics, { topic }) => {
        prevTopics.unshift(topic);
        return prevTopics;
    }, []);
    const topicsRefetch = {} as { [key: string]: (() => any) };
    allTopics.forEach(topic => {
        const { refetch } = useQuery<QRslt>(DataQuery, {
            variables: { topic },
            onCompleted: async res => {
                // console.log(`Received query`, res);
                data[topic] = res.topicBuffer.map(packet => packet.data).reverse();
                setData(data);
            }
        });
        topicsRefetch[topic] = refetch;
        useSubscription<SubRslt>(DataSubscription, {
            variables: { topicList: [topic] },
            onSubscriptionData: async res => {
                if (res.subscriptionData.error) {
                    setErrorMsg(getErrorMessage(res.subscriptionData.error));
                    return;
                }
                const subData = res.subscriptionData;
                if (subData) {
                    if (subData.data && subData.data.mqttTopics) {
                        const message = subData.data.mqttTopics.data;
                        if (data[topic]) {
                            data[topic].unshift(message);
                            setData(data);
                        } else {
                            data[topic] = [message];
                            console.log(`${topic} topic added.`);
                            setData(data);
                        }
                    } else {
                        console.warn("Received empty data packet.");
                    }
                }
            }
        });
    });
    useEffect(() => allTopics.forEach(topic => {
        topicsRefetch[topic]();
    }));
    const renderedData = props.dataElements.map((settings, index) => {
        var panel = (<h1>Error:No panel loaded</h1>);
        return (<div className="panel-wraper" key={index.toString() + "-panel"}>
            {getPanelFromProps({ settings, data, mqttPublish } as UnionPanelProps)}
        </div>)
    });
    if (true) {
        return (<div>
            {errorMsg ? (<div className="alert alert-warning" role="alert">{errorMsg}</div>) : (<div></div>)}
            {renderedData}
        </div>)
    }
}

export default livedata;