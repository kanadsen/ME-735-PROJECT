// Profile view and tutorial

import React from 'react'
import {  AwesomeButton, AwesomeButtonSocial } from 'react-awesome-button';
import "react-awesome-button/dist/styles.css";
import { ReactComponent as InfoLogo } from '../assets/info.svg';

function Tutorial(props)
 {    return (
        <div className = "info_container">
            <h1 id = "info_title">Pathfinder Visualizer Information</h1>
            <div className = "legend_table">
            <table>
              <tbody>
                <tr>
                    <td>
                    <div className="start_square" ></div>
                    </td>
                    <td>Start Node</td>
                </tr>
                <tr>
                    <td>
                    <div className="finish_square" ></div>
                    </td>
                    <td>Finish Node</td>
                </tr>
                <tr>
                    <td>
                    <div className="visited_square" ></div>
                    </td>
                    <td>Visited Node</td>
                </tr>
                <tr>
                    <td>
                    <div className="path_square" ></div>
                    </td>
                    <td>Path Node</td>
                </tr>
              </tbody>
            </table>
            </div>
            <div className = "info_buttons">
                <div className = "info_socials" id = "tutorial_button">
                    <AwesomeButton
                        type="secondary"
                        size = "small"
                    >
                        Tutorial
                    </AwesomeButton>
                </div>
                <div className = "info_socials" id = "gh_button">
                    <AwesomeButtonSocial
                        type="github"
                        url= "www.github.com/kanadsen"
                        size = "small"
                    >
                        Github
                    </AwesomeButtonSocial>
                </div>
                <div className = "info_socials" id = "linkedin">
                    <AwesomeButtonSocial
                        type="linkedin"
                        url="www.linkedin.com/in/kanad-sen-868968167"
                        size = "small"
                    >
                        LinkedIn
                    </AwesomeButtonSocial>
                </div>
                <div className = "info_socials" id = "buy_me_a_coffee">
                    <AwesomeButton
                        type="secondary"
                        url="www.linkedin.com/in/kanad-sen-868968167"
                        size = "large"
                    >
                        About this project
                    </AwesomeButton>
                </div>
                <InfoLogo id = "info_icon"/>
            </div>
        </div>
    )
}

export default Tutorial
