class MatchSetup {
    constructor(team1Role, team2Role) {
        this.winner = null;
        this.bans = 0;
        this.isBo7 = false;
        this.banCount = 0;
        this.currentBanUser = null;
        this.noCurrentBanUser = null;
        this.banPhaseFlag = true;
        this.pickingTeam = null;
        this.team1Bans = {
            role: team1Role,
            user: null,
            mapsBanned: [],
            fp: false,
            map: false
        };
        this.team2Bans = {
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
            this.team1Bans.mapsBanned.push(map);
        } else if (team === 2) {
            this.team2Bans.mapsBanned.push(map);
        }
    }

    getMapBan(team) {
        if (team === 1) {
            return this.team1Bans.mapsBanned;
        } else if (team === 2) {
            return this.team2Bans.mapsBanned;
        }
    }

    setUserToTeam(team, user){
        if (team === 1) {
            this.team1Bans.user = user;
        } else if (team === 2) {
            this.team2Bans.user = user;
        }
    }

    getUserFromTeam(team){
        if (team === 1) {
            return this.team1Bans.user;
        } else if (team === 2) {
            return this.team2Bans.user = user;
        }
    }

    getTeamFp() {
        if (this.team1Bans.fp) {
            return team1Bans;
        } else if (this.team2Bans.fp) {
            return team2Bans;
        }
        return null;
    }
    
    getTeamMap() {
        if (this.team1Bans.map) {
            return team1Bans;
        } else if (this.team2Bans.map) {
            return team2Bans;
        }
        return null;
    }

    setFirstPickAndMap(fpmap, chosenTeam){
        if (fpmap === 'fp') {
            if (chosenTeam === team1Bans.user) {
                this.team1Bans.fp = true;
                this.team2Bans.map = true;
                this.currentBanUser = team2Bans.user;
            } else {
                this.team2Bans.fp = true;
                this.team1Bans.map = true;
                this.currentBanUser = team1Bans.user;
            }
        } else if (fpmap === 'map') {
            if (chosenTeam === team1Bans.user) {
                this.team1Bans.map = true;
                this.team2Bans.fp = true;
                this.currentBanUser = team1Bans.user;
            } else {
                this.team2Bans.map = true;
                this.team1Bans.fp = true;
                this.currentBanUser = team2Bans.user;
            }
        }
    }

}
