import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkInsert('qualification_projects', [
		{
			id: 679,
			name: 'Full Stack Open - osa 0 - Web-sovellusten toiminnan perusteet ',
			description: 'Tutustu kurssin johdanto-osaan ja tee siihen liittyvät tehtävät. Palauta osan tehtävät kurssin ohjeiden mukaisesti github-repositoryyn. Liitä linkki repositoryyn projektin raportti-kohtaan. Voit myös kirjoittaa raporttiin huomioita oppimistasi asioista. Muista täyttää työajanseurantaa koko projektin suorituksen ajan.',
			materials: 'https://fullstackopen.com/osa0',
			duration: 100,
			is_active: true,
		},
		{
			id: 681,
			name: 'Full Stack Open - osa 1 - Reactin perusteet',
			description: 'Tässä projektissa tutustut Reactin alkeisiin. Tutustu materiaaliin ja esimerkkeihin. Esimerkit kannattaa kokeilla käytännössä itsekin. Voit myös katsoa osaan 1 liittyvät luentovideot. Videot löytyvät tämän projektin materiaaleista. Tee kaikki osan tehtävät ja palauta ne samaan github-repositorylinkkinä. Voit tehdä osaa varten oman repositoryn tai voit käyttää samaa repositoryä, johon teit myös osan 0 tehtävät.',
			materials: 'https://fullstackopen.com/osa1',
			duration: 100,
			is_active: true,
		},

	]);
};
export const down: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkDelete('qualification_projects', null, {});
};
exports.down = down;
