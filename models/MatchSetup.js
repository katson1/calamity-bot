class MatchSetup {
    constructor(team1Role, team2Role) {
        this.winner = null;
        this.bans = 0;
        this.isBo7 = false;
        this.banCount = 0;
        this.currentBanUser = '';
        this.noCurrentBanUser = '';
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

    
}
