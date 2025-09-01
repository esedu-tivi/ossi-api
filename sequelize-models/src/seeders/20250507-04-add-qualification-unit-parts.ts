import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkInsert('qualification_unit_parts', [
		{
			id: 172,
			name: 'OKK1 - Full Stack Open',
			description: 'Seuraa Helsingin yliopiston Full Stack Open -kurssin sisältöä. Jokainen kurssin osa on jaettu omaksi projektikseen. Tee projektit järjestyksessä ja seuraa niitä tehdessäsi työaikaa mahdollisimman tarkasti. Kokoa kurssin tehtävät yhteen Git-repositoryyn tai tee jokaisesta osasta oma repository. Kun osa on valmis liitä linkki repositoryyn Raportti-kohtaan.',
			materials: 'https://fullstackopen.com/#course-contents',
			qualification_unit_id: 6779606,
			unit_order_index: 1,
		},
	]);
};
export const down: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkDelete('qualification_unit_parts', null, {});
};
