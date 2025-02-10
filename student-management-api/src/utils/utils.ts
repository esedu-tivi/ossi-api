import axios from "axios";

async function getExternalCompetenceRequirements(qualificationId: number, unitId: number) {
    const response = await axios.get(`https://virkailija.opintopolku.fi/eperusteet-service/api/external/peruste/${qualificationId}/tutkinnonOsat/${unitId}`)
    
    const qualificationCompetenceRequirementGroupsMapped = response
        .data["ammattitaitovaatimukset2019"]["kohdealueet"]
        .map(group => ({
            id: group["kuvaus"]["_id"],
            qualificationUnitId: unitId,
            title: group["kuvaus"]["fi"],
        })
    );

    const qualificationCompetenceRequirementDescriptionsList = response
        .data["ammattitaitovaatimukset2019"]["kohdealueet"]
        .reduce((list, group) => {
            const requirements = group["vaatimukset"].map(requirement => ({
                id: requirement["koodi"]["id"],
                groupId: group["kuvaus"]["_id"],
                description: requirement["vaatimus"]["fi"]
            }))

            return [...list, ...requirements];
        }, []
    );

    return { qualificationCompetenceRequirementGroupsMapped, qualificationCompetenceRequirementDescriptionsList }
}

export { getExternalCompetenceRequirements };
