import { useState, useEffect } from "react";
import { useQuery } from '@apollo/client';
import { readAssetsQuery } from 'graphql/query/readAssets';
import ReactMarkdown from 'react-markdown';
import { PolicyBreadcrumbs } from 'components';
import { convertToDot, valueFromDot } from "utils";
import { useTheme } from "@emotion/react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { CommonProps } from "types";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        '& a': {
            color: theme.palette.secondary.dark,
        },
    },
}));

export const PrivacyPolicyPage = ({
    business
}: Pick<CommonProps, 'business'>) => {
    const classes = useStyles();
    const theme = useTheme();
    const [privacy, setPrivacy] = useState(null);
    const { data: privacyData } = useQuery(readAssetsQuery, { variables: { files: ['privacy.md'] } });

    useEffect(() => {
        if (privacyData === undefined) return;
        let data = privacyData.readAssets[0];
        // Replace variables
        const business_fields = Object.keys(convertToDot(business));
        business_fields.forEach(f => data = data.replaceAll(`<${f}>`, valueFromDot(business, f) || ''));
        setPrivacy(data);
    }, [privacyData, business])

    return (
        <div id="page" className={classes.root}>
            <PolicyBreadcrumbs textColor={theme.palette.secondary.dark} />
            <ReactMarkdown>{ privacy }</ReactMarkdown>
        </div>
    );
}