import axios from "axios";

async function getExternalQualificationData(qualificationId: number) {
    const response = await axios.get(`https://virkailija.opintopolku.fi/eperusteet-service/api/external/peruste/${qualificationId}`);

    const qualificationUnitsMapped = response
        .data["tutkinnonOsat"]
        .filter(unit => unit["tyyppi"] == "normaali") // filtering YTOs
        .map(unit => ({
            id: unit["id"],
            qualificationId: qualificationId,
            name: unit["nimi"]["fi"],
            scope: unit["laajuus"]
        }));
    
    const qualificationCompetenceRequirementGroupsMapped = response
        .data["tutkinnonOsat"]
        .filter(unit => unit["tyyppi"] == "normaali") // filtering YTOs
        .reduce((list, unit) => [
            ...list,
            ...unit["ammattitaitovaatimukset2019"]["kohdealueet"]
                .map(group => ({
                    id: group["kuvaus"]["_id"],
                    qualificationUnitId: unit["id"],
                    title: group["kuvaus"]["fi"],
                }))
        ], []);

    const qualificationCompetenceRequirementDescriptionsList = response
        .data["tutkinnonOsat"]
        .filter(unit => unit["tyyppi"] == "normaali") // filtering YTOs
        .reduce((list, unit) => [
            ...list, 
            ...unit["ammattitaitovaatimukset2019"]["kohdealueet"]
                .reduce((list, group) => {
                    const requirements = group["vaatimukset"].map(requirement => ({
                        id: requirement["koodi"]["id"],
                        groupId: group["kuvaus"]["_id"],
                        description: requirement["vaatimus"]["fi"]
                    }))

                    return [...list, ...requirements];
                }, [])
        ], []);

    return {
        units: qualificationUnitsMapped,
        competenceRequirementGroups: qualificationCompetenceRequirementGroupsMapped,
        competenceRequirements: qualificationCompetenceRequirementDescriptionsList,
    };
}

export { getExternalQualificationData };
