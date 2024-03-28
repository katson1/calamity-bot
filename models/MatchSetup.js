export class MatchSetup {
    constructor(team1Role, team2Role) {
        this.winner = null;
        this.bans = 0;
        this.isBo7 = false;
        this.banCount = 0;
        this.currentBanUser = null;
        this.noCurrentBanUser = null;
        this.banPhaseFlag = true;
        this.pickingTeam = null;
        var totalWinsToFinish = 0;
        this.team1Controller = {
            role: team1Role,
            user: null,
            mapsBanned: [],
            fp: false,
            map: false
        };
        this.team2Controller = {
            role: team2Role,
            user: null,
            mapsBanned: [],
            fp: false,
            map: false
        };
    }


    startBanPhase() {
        this.banPhaseFlag = true;
    }

    startPickPhase() {
        this.banPhaseFlag = false;
    }

    addMapBan(team, map) {
        if (team === 1) {
            this.team1Controller.mapsBanned.push(map);
        } else if (team === 2) {
            this.team2Controller.mapsBanned.push(map);
        }
    }

    getMapBan(team) {
        if (team === 1) {
            return this.team1Controller.mapsBanned;
        } else if (team === 2) {
            return this.team2Controller.mapsBanned;
        }
    }

    setUserToTeam(team, user){
        if (team === 1) {
            this.team1Controller.user = user;
        } else if (team === 2) {
            this.team2Controller.user = user;
        }
    }

    getUserFromTeam(team){
        if (team === 1) {
            return this.team1Controller.user;
        } else if (team === 2) {
            return this.team2Controller.user = user;
        }
    }

    getTeamFp() {
        if (this.team1Controller.fp) {
            return team1Controller;
        } else if (this.team2Controller.fp) {
            return team2Controller;
        }
        return null;
    }
    
    getTeamMap() {
        if (this.team1Controller.map) {
            return team1Controller;
        } else if (this.team2Controller.map) {
            return team2Controller;
        }
        return null;
    }

    setFirstPickAndMap(fpmap, chosenTeam){
        if (fpmap === 'fp') {
            if (chosenTeam === team1Controller.user) {
                this.team1Controller.fp = true;
                this.team2Controller.map = true;
                this.currentBanUser = team2Controller.user;
            } else {
                this.team2Controller.fp = true;
                this.team1Controller.map = true;
                this.currentBanUser = team1Controller.user;
            }
        } else if (fpmap === 'map') {
            if (chosenTeam === team1Controller.user) {
                this.team1Controller.map = true;
                this.team2Controller.fp = true;
                this.currentBanUser = team1Controller.user;
            } else {
                this.team2Controller.map = true;
                this.team1Controller.fp = true;
                this.currentBanUser = team2Controller.user;
            }
        }
    }

}
