import axios from "axios"
import { Resolver } from "../resolver.js"

const competenceRequirementGroups: Resolver<{ id: number }, null> = async (parent, _, context) => {
    const response = await axios.get(`https://virkailija.opintopolku.fi/eperusteet-service/api/external/peruste/7861752/tutkinnonOsat/${parent.id}`)
    return response.data["ammattitaitovaatimukset2019"]["kohdealueet"].map(group => ({
        id: group["kuvaus"]["_id"],
        description: group["kuvaus"],
        requirements: group["vaatimukset"].map(requirement => ({
            id: requirement["koodi"]["id"],
            description: requirement["vaatimus"]
        }))
    }));
}

export const QualificationUnit = {
    competenceRequirementGroups,
}
