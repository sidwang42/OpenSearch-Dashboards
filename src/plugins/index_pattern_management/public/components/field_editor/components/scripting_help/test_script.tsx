/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import './test_script.scss';

import React, { Component, Fragment } from 'react';

import {
  EuiSmallButton,
  EuiCodeBlock,
  EuiCompressedComboBox,
  EuiCompressedFormRow,
  EuiText,
  EuiSpacer,
  EuiTitle,
  EuiCallOut,
  EuiComboBoxOptionOption,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';

import { opensearchQuery, IndexPattern, Query } from '../../../../../../data/public';
import { context as contextType } from '../../../../../../opensearch_dashboards_react/public';
import { IndexPatternManagmentContextValue } from '../../../../types';
import { ExecuteScript } from '../../types';

interface TestScriptProps {
  indexPattern: IndexPattern;
  lang: string;
  name?: string;
  script?: string;
  executeScript: ExecuteScript;
}

interface AdditionalField {
  value: string;
  label: string;
}

interface TestScriptState {
  isLoading: boolean;
  additionalFields: AdditionalField[];
  previewData?: Record<string, any>;
}

export class TestScript extends Component<TestScriptProps, TestScriptState> {
  static contextType = contextType;

  // @ts-expect-error TS2612 TODO(ts-error): fixme
  public readonly context!: IndexPatternManagmentContextValue;

  defaultProps = {
    name: 'myScriptedField',
  };

  state = {
    isLoading: false,
    additionalFields: [],
    previewData: undefined,
  };

  componentDidMount() {
    if (this.props.script) {
      this.previewScript();
    }
  }

  previewScript = async (searchContext?: { query?: Query | undefined }) => {
    const { indexPattern, name, script, executeScript } = this.props;

    if (!script || script.length === 0) {
      return;
    }

    this.setState({
      isLoading: true,
    });

    let query;
    if (searchContext) {
      const opensearchQueryConfigs = opensearchQuery.getOpenSearchQueryConfig(
        this.context.services.uiSettings
      );
      query = opensearchQuery.buildOpenSearchQuery(
        this.props.indexPattern,
        searchContext.query || [],
        [],
        opensearchQueryConfigs
      );
    }

    const scriptResponse = await executeScript({
      name: name as string,
      script,
      indexPatternTitle: indexPattern.title,
      query,
      additionalFields: this.state.additionalFields.map((option: AdditionalField) => option.value),
      http: this.context.services.http,
      dataSourceId: indexPattern.dataSourceRef?.id,
    });

    if (scriptResponse.status !== 200) {
      this.setState({
        isLoading: false,
        previewData: scriptResponse,
      });
      return;
    }

    this.setState({
      isLoading: false,
      previewData: scriptResponse.hits?.hits.map((hit: any) => ({
        _id: hit._id,
        ...hit._source,
        ...hit.fields,
      })),
    });
  };

  onAdditionalFieldsChange = (selectedOptions: AdditionalField[]) => {
    this.setState({
      additionalFields: selectedOptions,
    });
  };

  renderPreview(previewData: { error: any } | undefined) {
    if (!previewData) {
      return null;
    }

    if (previewData.error) {
      return (
        <EuiCallOut
          title={i18n.translate('indexPatternManagement.testScript.errorMessage', {
            defaultMessage: `There's an error in your script`,
          })}
          color="danger"
          iconType="cross"
        >
          <EuiCodeBlock
            language="json"
            className="scriptPreviewCodeBlock"
            data-test-subj="scriptedFieldPreview"
          >
            {JSON.stringify(previewData.error, null, ' ')}
          </EuiCodeBlock>
        </EuiCallOut>
      );
    }

    return (
      <Fragment>
        <EuiTitle size="xs">
          <p>
            <FormattedMessage
              id="indexPatternManagement.testScript.resultsLabel"
              defaultMessage="First 10 results"
            />
          </p>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiCodeBlock
          language="json"
          className="scriptPreviewCodeBlock"
          data-test-subj="scriptedFieldPreview"
        >
          {JSON.stringify(previewData, null, ' ')}
        </EuiCodeBlock>
      </Fragment>
    );
  }

  renderToolbar() {
    const fieldsByTypeMap = new Map();
    const fields: EuiComboBoxOptionOption[] = [];

    this.props.indexPattern.fields
      .getAll()
      .filter((field) => {
        const isMultiField = field.subType && field.subType.multi;
        return !field.name.startsWith('_') && !isMultiField && !field.scripted;
      })
      .forEach((field) => {
        if (fieldsByTypeMap.has(field.type)) {
          const fieldsList = fieldsByTypeMap.get(field.type);
          fieldsList.push(field.name);
          fieldsByTypeMap.set(field.type, fieldsList);
        } else {
          fieldsByTypeMap.set(field.type, [field.name]);
        }
      });

    fieldsByTypeMap.forEach((fieldsList, fieldType) => {
      fields.push({
        label: fieldType,
        options: fieldsList.sort().map((fieldName: string) => {
          return { value: fieldName, label: fieldName };
        }),
      });
    });

    fields.sort((a, b) => {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    });

    return (
      <Fragment>
        <EuiCompressedFormRow
          label={i18n.translate('indexPatternManagement.testScript.fieldsLabel', {
            defaultMessage: 'Additional fields',
          })}
          fullWidth
        >
          <EuiCompressedComboBox
            placeholder={i18n.translate('indexPatternManagement.testScript.fieldsPlaceholder', {
              defaultMessage: 'Select...',
            })}
            options={fields}
            selectedOptions={this.state.additionalFields}
            onChange={(selected) => this.onAdditionalFieldsChange(selected as AdditionalField[])}
            data-test-subj="additionalFieldsSelect"
            fullWidth
          />
        </EuiCompressedFormRow>

        <div className="testScript__searchBar">
          <this.context.services.data.ui.SearchBar
            appName={'indexPatternManagement'}
            showFilterBar={false}
            showDatePicker={false}
            showQueryInput={true}
            query={this.context.services.data.query.queryString.getDefaultQuery()}
            onQuerySubmit={this.previewScript}
            indexPatterns={[this.props.indexPattern]}
            customSubmitButton={
              <EuiSmallButton
                disabled={this.props.script ? false : true}
                isLoading={this.state.isLoading}
                data-test-subj="runScriptButton"
              >
                <FormattedMessage
                  id="indexPatternManagement.testScript.submitButtonLabel"
                  defaultMessage="Run script"
                />
              </EuiSmallButton>
            }
          />
        </div>
      </Fragment>
    );
  }

  render() {
    return (
      <Fragment>
        <EuiSpacer />
        <EuiText>
          <h3>
            <FormattedMessage
              id="indexPatternManagement.testScript.resultsTitle"
              defaultMessage="Preview results"
            />
          </h3>
          <p>
            <FormattedMessage
              id="indexPatternManagement.testScript.instructions"
              defaultMessage="Run your script to preview the first 10 results. You can also select some additional
              fields to include in your results to gain more context or add a query to filter on
              specific documents."
            />
          </p>
        </EuiText>
        <EuiSpacer />
        {this.renderToolbar()}
        <EuiSpacer />
        {this.renderPreview(this.state.previewData)}
      </Fragment>
    );
  }
}
