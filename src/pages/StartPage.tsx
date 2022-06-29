import { Button, Collapse, Divider, Form, Input, Layout, Select, Slider, Spin,Switch } from 'antd';
import React, { Component } from 'react';

const { TextArea } = Input;
const { Sider, Content } = Layout;
const { Option } = Select;
const separator = '\n';

const engines = [
    {
        code: 'davinci-codex',
        group: 'codex',
        url: 'https://api.openai.com/v1/engines/davinci-codex/completions'
    },
    {
        code: 'text-davinci-002',
        group: 'gpt-3',
        url: 'https://api.openai.com/v1/engines/text-davinci-002/completions'
    },];

const Z_DEFAULT_CONTEXT = "The following is a conversation with a highly intelligent AI assistant. The assistant is helpful, creative, clever, and very friendly.  Problematization of a term, writing, opinion, ideology, identity, or person is to consider the concrete or existential elements of those involved as challenges (problems) that invite the people involved to transform those situations which is used often in this dialogue.\n" +
    "Human: Hello, who are you?\n" +
    "AI: I am an AI created by OpenAI. How can I help you today?\n" +
    "Human: What is creativity?\n" +
    "AI: Creativity is the ability to see things from a different perspective and come up with new ideas. It involves thinking outside the box and coming up with original solutions."
const Z_DEFAULT_PREFIX = "Human:"

export default class StartPage extends Component {

    state = {
        formData: {
            context: Z_DEFAULT_CONTEXT,
            input: null,
        },
        response: 'cleared',
        queryConfig: {
            prefix: Z_DEFAULT_PREFIX,
            maxToken: 300,
            temperature: 0.9
        },
        modelCode: 'davinci-codex',
        activeStopParameters: true,
        stopParameters: [Z_DEFAULT_PREFIX],
        loading: false
    };

    componentDidMount(): void {
        let inputStr = window.sessionStorage.getItem( 'input' );
        if( inputStr ) {

            let storedInput = JSON.parse( inputStr );
            this.setState( { formData: storedInput } );
        }
    }

    componentWillUnmount(): void {

    }

    onInputChange = ( event ) => {
        this.setState( {
            formData: {
                context: this.state.formData.context,
                input: event.target.value

            }
        } );
    };

    onContextChange = ( event ) => {
        this.setState( {
            formData: {
                context: event.target.value,
                input: this.state.formData.input
            }
        } );
    }

    onPrefixChange = ( event ) => {
        this.setState( {
            queryConfig: {
                prefix: event.target.value,
                maxToken: this.state.queryConfig.maxToken,
                temperature: this.state.queryConfig.temperature
            }
        } );
    };

    onTemperatureChange = ( value ) => {
        this.setState( {
            queryConfig: {
                prefix: this.state.queryConfig.prefix,
                maxToken: this.state.queryConfig.maxToken,
                temperature: value / 100
            },
        } );
    };

    onEngineChange = (engineCode) => {
        console.log(`selected ${engineCode}`);
        this.setState({modelCode: engineCode})
    }

    handleStopChange = (stopElements) => {
        console.log(`selected stops ${stopElements}`);
        if (this.state.activeStopParameters){
            this.setState({stopParameters: stopElements.map(e => e.replace(/\\/g, "\\"))})
        }
    }

    onToggleStopChange = (checked) => {
        this.setState({activeStopParameters: checked})
    }

    storeInputInSession = () => {
        window.sessionStorage.setItem( 'input', JSON.stringify( this.state.formData ) );
    };

    clearInputFromSession = () => {
        window.sessionStorage.removeItem( 'input' );
    };

    handleBtnClick = () => {
        const contextTxtEl = document.querySelector( '#context' ) as HTMLInputElement;
        let contextTxt = contextTxtEl ? contextTxtEl.value : '';
        const inputTxtEl = document.querySelector( '#input' ) as HTMLInputElement;
        let inputTxt = inputTxtEl ? inputTxtEl.value : '';

        this.storeInputInSession();
        if( !inputTxt || !contextTxt ) {
            this.setState( { response: 'Error: Input or context empty!' } );
        } else {
            this.setState( { loading: true } );
            this.callOpenAiApi( contextTxt, inputTxt )
                .then( response => response.json() )
                .then( data => {
                    let resObj = JSON.parse( JSON.stringify( data ) );
                    if( resObj && resObj.choices && resObj.choices[0] ) {
                        // console.log('json response:', resObj, data);
                        // console.log('choice details:', resObj.choices[0]);
                        let responseText = resObj.choices[0].text;
                        if (responseText){
                            this.setState( { response: responseText, loading: false } );
                        } else {
                            console.error( 'OpenAI Empty Response:', data, this.state.stopParameters );
                            this.setState( { response: 'Error -> empty response. Reason: ' + resObj.choices[0].finish_reason, loading: false } );
                        }
                    } else {
                        console.error( 'OpenAI Error:', data );
                        this.setState( { response: '!Error!', loading: false } );
                    }
                } );
        }
    };

    handleAppendClick = () => {
        const contextTxt = this.state.formData.context;
        const inputTxt = this.state.formData.input;
        const response = this.state.response;

        if( !inputTxt || !contextTxt || !response ) {
            this.setState( { response: 'Error: Input, context or response empty!' } );
        } else {
            this.setState( {
                formData: {
                    context: `${contextTxt}${separator}${inputTxt}${separator}${response}`,
                    input: this.state.queryConfig.prefix
                },
                response: 'cleared'
            } );
            this.storeInputInSession();
        }
    };

    handleResetClick = () => {
        this.clearInputFromSession()
        this.setState( {
            formData: {
                context: Z_DEFAULT_CONTEXT,
                input: this.state.queryConfig.prefix
            },
            response: ''
        } );
    };

    callOpenAiApi = ( contextTxt: string, inputTxt: string ) => {

        const requestBody = {
            'prompt': `${contextTxt}${separator}${inputTxt}`,
            'temperature': this.state.queryConfig.temperature,
            'max_tokens': this.state.queryConfig.maxToken,
            'top_p': 1.0,
            'frequency_penalty': 0.7,
            'presence_penalty': 0.6,
            'stop': this.state.activeStopParameters? this.state.stopParameters : null

        };

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify( requestBody )
        };

        return fetch( "/query?engineCode="+this.state.modelCode, requestOptions );
    };

    // callOpenAiApi = ( contextTxt: string, inputTxt: string ) => {
    //
    //     const requestBody = {
    //         'prompt': `${contextTxt}${separator}${inputTxt}`,
    //         'temperature': this.state.queryConfig.temperature,
    //         'max_tokens': this.state.queryConfig.maxToken,
    //         'top_p': 1.0,
    //         'frequency_penalty': 0.7,
    //         'presence_penalty': 0.6,
    //         'stop': this.state.activeStopParameters? this.state.stopParameters : null
    //
    //     };
    //
    //     const requestOptions = {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer xxx' },
    //         body: JSON.stringify( requestBody )
    //     };
    //
    //     let engine = engines.find(e => e.code === this.state.modelCode)
    //     // console.log('engine', this.state.modelCode, engine,  engines)
    //     // console.log('engine', this.state.modelCode, engine.url, requestOptions)
    //
    //     // return fetch( 'https://api.openai.com/v1/engines/davinci-codex/completions', requestOptions );
    //     return fetch( engine.url, requestOptions );
    // };

    render() {

        let title = 'Start Page';

        let content = this.state.response;
        return (
            <Layout>
                <Sider width={200} style={{ minWidth: 50 }}>Sider1</Sider>
                <Content>
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <Divider>Context</Divider>
                        <TextArea id="context" rows={3} placeholder="Context" autoComplete='off' style={{ width: '100%' }}
                                  autoSize={{ minRows: 5, maxRows: 10 }}
                                  value={this.state.formData.context} onChange={this.onContextChange}/>
                        <Divider>Your wish</Divider>
                        <div>
                        <TextArea id="input" rows={3} placeholder="Your wish" autoComplete='off' style={{ width: '100%' }}
                                  value={this.state.formData.input} onChange={this.onInputChange}/>
                        </div>
                        <Divider>Response</Divider>
                        <div style={{ border: '1px solid lightgreen', borderRadius: 3, fontWeight: 700 }}>
                            <Spin spinning={this.state.loading}>
                                <p>{content}</p>
                            </Spin>
                        </div>
                        <Divider/>
                        <Button type="primary" onClick={this.handleBtnClick}>Query AI</Button>
                        <Button danger onClick={this.handleAppendClick} disabled={!this.state.response} style={{float: 'right'}}>Append Answer</Button>

                        <Divider>Configuration</Divider>
                        <Collapse>
                            <Collapse.Panel header="Model Configuration" key="1">
                                <Form>
                                    <Form.Item label="Engine">
                                        <Select style={{ width: 120 ,float:'left'}}
                                                value={this.state.modelCode}
                                                onChange={this.onEngineChange}>
                                            {engines.map(e => <Option value={e.code} key={'code-'+e.code}>{e.group}</Option>)}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Prefix">
                                        <Input id="prefix" placeholder="Prefix" value={this.state.queryConfig.prefix} onChange={this.onPrefixChange}/>
                                    </Form.Item>
                                    <Form.Item label="Temperature">
                                        <Slider id="temperature" value={this.state.queryConfig.temperature * 100} onChange={this.onTemperatureChange} step={5}/>
                                    </Form.Item>
                                    <Form.Item label="Activate stop keywords">
                                        <Switch checked={this.state.activeStopParameters} onChange={this.onToggleStopChange} style={{float:'left'}}/>
                                    </Form.Item>
                                    <Form.Item label="Stop keywords">
                                        <Select mode="tags" style={{width:'100%'}} disabled={!this.state.activeStopParameters}
                                                placeholder="Tags Mode" onChange={this.handleStopChange} defaultValue={Z_DEFAULT_PREFIX}>
                                                {this.state.stopParameters? this.state.stopParameters.map(e => <Option value={e} key={'code-'+e}>{e}</Option>) : null}
                                            </Select>
                                    </Form.Item>
                                    <Form.Item label="Actions">
                                        <Button danger onClick={this.handleResetClick} style={{float: 'left'}}>Reset Context</Button>
                                    </Form.Item>
                                </Form>



                            </Collapse.Panel>
                        </Collapse>
                    </div>
                </Content>
                <Sider width={200} style={{ minWidth: 50 }}>Sider2</Sider>
            </Layout>

        );
    }
}
