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

    const qualificationTitles = response
        .data["tutkintonimikkeet"]
        .map(title => ({
            id: title["id"],
            name: title["nimi"]["fi"]
        }));

    const mandatoryQualificationTitleUnits = response
        .data["suoritustavat"][0]["rakenne"]["osat"][0]["osat"]
        .filter(vocation => vocation["nimi"]["en"] != "Compulsory unit" && vocation["nimi"]["en"] != "Optional units") // filter out TVP and optional
        .map(vocation => vocation["osat"][0]["osat"].map(titleUnit => ({
            titleId: qualificationTitles.find(title => title.name == vocation["nimi"]["fi"]).id,
            unitId: qualificationUnitsMapped.find(unit => unit.name == titleUnit["nimi"]["fi"]).id
        })))
        .flat();

    return {
        units: qualificationUnitsMapped,
        competenceRequirementGroups: qualificationCompetenceRequirementGroupsMapped,
        competenceRequirements: qualificationCompetenceRequirementDescriptionsList, 
        qualificationTitles: qualificationTitles,
        mandatoryQualificationTitleUnits: mandatoryQualificationTitleUnits
    };
}

export { getExternalQualificationData };
