import { gql } from '@apollo/client';
import { useState, useEffect } from 'react';
import { useSubscription, useMutation, useQuery } from '@apollo/client';
import { Button, CircularProgress, Container } from '@material-ui/core';
import DeviceNode, { device } from './DeviceNode';


const GetDevices = gql`
query GetDevices {
  devices {
    ip
    uri
    deviceSchema
    name
    osName
    platform
  }
}
`


interface QRslt {
  devices: device[]
}

// const DataSubscription = gql`
// subscription getData($topicList: [String]!) {
//   mqttTopics(topics: $topicList) {
//       data
//   }
// }
// `

// interface SubRslt {
//     mqttTopics: { data: Object }
// }

const SendDeviceRefresh = gql`
mutation SendDeviceRefresh{
  mqttPublish(input:{topic:"__widaq_req_info__", payload:{}}) {
    success
  }
}
`

const devicenetwork = (props: any) => {
  const [network, setNetwork] = useState<device[] | null>(null);
  const [refreshDevices] = useMutation(SendDeviceRefresh);
  useQuery<QRslt>(GetDevices, {
    onCompleted: (data) => {
      setNetwork(data.devices)
    }
  })
  if (network) {
    const renderedDevices = network.map(device => {
      console.log(device);
      return (<>
        <DeviceNode device={device} key={device.uri} />
      </>)
    })
    return (<Container>
      {renderedDevices}
    </Container>)
  } else {
    return (<Container maxWidth="sm"><h1>Device Network Loading</h1><CircularProgress /></ Container>)
  }

}

export default devicenetwork;