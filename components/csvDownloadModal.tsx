import { Button, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, DialogTitle, DialogContent, DialogContentText, DialogActions, LinearProgress } from '@material-ui/core';
import MaterialTable, { Column } from 'material-table';
import { getErrorMessage } from './errorFormatting';
import download from 'downloadjs';
import { Parser } from 'json2csv';
import { ApolloError } from '@apollo/client';

interface csvDownloadProps {
    topic: string | null;
    setTopic: (topic: string | null) => void;
    data: Object[] | undefined;
    loading: boolean;
    error?: ApolloError;
    csvLink?: string;
    csvLinkLoading?: boolean;
    csvLinkError?: ApolloError;
    useCsvLink?: boolean;
}

const flattenObject = (ob: any) => {
    var toReturn: any = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

const csvDownloadModal = (props: csvDownloadProps) => {
    if (!props.topic) {
        return <div>
            Internal Error: CSV Download received no topic.
        </div>
    }
    console.log(props);
    if (props.loading) {
        return <CircularProgress />
    } else if (props.error) {
        return <div>{getErrorMessage(props.error)}</div>
    } else if (props.csvLinkError) {
        return <div>{getErrorMessage(props.csvLinkError)}</div>
    } else if (props.data) {
        const rowData = props.data!.map(packet => flattenObject(packet));
        const onDownloadModalFinish = (accepted: boolean) => {
            if (accepted && props.topic) {
                const parser = new Parser();
                download(parser.parse(rowData), `${props.topic}.csv`);
            }
            props.setTopic(null);
        }
        var downloadCSVButton = <Button onClick={() => onDownloadModalFinish(true)} color="primary">
            Save CSV
        </Button>
        if (props.useCsvLink) {
            console.log("Using csv link");
            downloadCSVButton = <Button onClick={() => {
                if (props.csvLink)
                    window.open(props.csvLink, '_blank');
                else
                    console.log("Use press download before link exists.")
                onDownloadModalFinish(false)
            }} color="primary" disabled={props.csvLinkLoading}>
                Save CSV
            </Button>
        }
        if (rowData.length === 0) {
            return <div>The ${props.topic} buffer is empty.</div>
        } else {
            const columnHeaders = Object.keys(rowData[0]).map(key => { return { title: key, field: key, type: typeof rowData[0][key], editable: 'never' } }) as Array<Column<any>>;
            return (<>
                <DialogContent>
                    <DialogContentText id="download-modal-description">
                        <MaterialTable title={`Downloading ${props.topic}`} columns={columnHeaders} data={rowData/*query => new Promise((accept, reject) => {
                            accept({ data: rowData, page: 1, totalCount: 1 })
                        })
                    */}>

                        </MaterialTable>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onDownloadModalFinish(false)} color="primary">
                        Cancel
                    </Button>
                    {downloadCSVButton}
                </DialogActions>
            </>)
        }
    } else {
        return <div />;
    }
}

export default csvDownloadModal;