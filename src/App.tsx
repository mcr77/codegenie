import React from 'react';
import './App.css';
import { Link, Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import StartPage from './pages/StartPage';
import { Layout, Menu } from 'antd';

const { Header, Content, Footer } = Layout;

const history = createBrowserHistory();

function App() {
    return (
        <Router history={history}>
            <Layout className="App">
                <Header className="App-header">
                    <div>
                        <Menu mode="horizontal">
                            <Menu.Item key="home">
                                <Link to="/">Home</Link>
                            </Menu.Item>
                            <Menu.Item key="about">
                                <Link to="/about">About</Link>
                            </Menu.Item>
                            <Menu.Item key="dashboard">
                                <Link to="/dashboard">Dashboard</Link>
                            </Menu.Item>
                        </Menu>
                    </div>
                </Header>
                <Content>

                    {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
                    <Switch>
                        <Route exact path="/">
                            <StartPage/>
                        </Route>
                        <Route path="/about">
                            <About/>
                        </Route>
                        <Route path="/dashboard">
                            <Dashboard/>
                        </Route>
                    </Switch>
                </Content>
                <Footer>
                    &nbsp;
                </Footer>
            </Layout>
        </Router>
    );
}

export default App;

function About() {
    return (
        <div>
            <h2>About</h2>
        </div>
    );
}

function Dashboard() {
    return (
        <div>
            <h2>Dashboard</h2>
        </div>
    );
}


