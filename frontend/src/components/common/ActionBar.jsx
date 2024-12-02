import React from 'react';
import {Link} from 'react-router-dom';
import HomeIcon from '../../assets/svg/HomeIcon';
import ChatIcon from '../../assets/svg/ChatIcon';
import ProjectIcon from '../../assets/svg/ProjectIcon';
import TeamIcon from '../../assets/svg/TeamIcon';

function ActionBar(props){
    const roleCondition = (role) => {
        if(role === "PROFESSOR"){
            return(
                <li>
                    <Link className="action-link" to={"/"}>
                        <TeamIcon />
                        <span>Team Management</span>
                    </Link>
                </li>
            );
        } else if(role === "STUDENT"){
            return(<></>);
        }
    }

    return(
        <aside className="action-bar">
            <ul className="action-bar-list">
                <li>
                    <Link className="action-link" to={"/userDashboard" + props.id}>
                        <HomeIcon />
                        <span>Home</span>
                    </Link>
                </li>
                <li>
                    <Link className="action-link" to={"/"}>
                        <ChatIcon />
                        <span>Chat</span>
                    </Link>
                </li>
                <li>
                    <Link className="action-link" to={"/"}>
                        <ProjectIcon />
                        <span>Project</span>
                    </Link>
                </li>
                {roleCondition(props.role)}
            </ul>
        </aside>
    );
}