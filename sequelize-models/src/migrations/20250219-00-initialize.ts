import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('qualification_projects', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: new DataTypes.STRING(128),
    description: new DataTypes.STRING(1024),
    materials: new DataTypes.STRING(1024),
    duration: DataTypes.INTEGER.UNSIGNED,
    isActive: {
        type: DataTypes.BOOLEAN,
        field: "is_active",
    }
  });
  await queryInterface.createTable('qualification_project_tags', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: new DataTypes.STRING(128)
  });
  await queryInterface.createTable('qualification_projects_tags_relations', {
    qualificationProjectId: {
      type: DataTypes.INTEGER,
      field: "qualification_project_id",
      primaryKey: true,
      references: {
        model: "qualification_projects",
        key: "id"
      }
    },
    qualificationProjectTagId: {
      type: DataTypes.INTEGER,
      field: "qualification_project_tag_id",
      primaryKey: true,
      references: {
        model: "qualification_project_tags",
        key: "id"
      }
    }
  });
  await queryInterface.createTable('qualification_units', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: "eperuste_id",
      primaryKey: true,
    },
    qualificationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: "qualification_id"
    },
    name: new DataTypes.STRING(128),
    scope: DataTypes.INTEGER.UNSIGNED,
  });
  await queryInterface.createTable('qualification_unit_parts', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: new DataTypes.STRING(128),
    description: new DataTypes.TEXT(),
    materials: new DataTypes.TEXT(),
    qualificationUnitId: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "qualification_unit_id",
        references: {
            model: "qualification_units",
            key: "eperuste_id"
        }
    },
  });
  await queryInterface.createTable('qualification_projects_parts_relations', {
    qualificationProjectId: {
      type: DataTypes.INTEGER,
      field: "qualification_project_id",
      primaryKey: true,
      references: {
          model: "qualification_projects",
          key: "id"
      }
    },
    qualificationUnitPartId: {
        type: DataTypes.INTEGER,
        field: "qualification_unit_part_id",
        primaryKey: true,
        references: {
            model: "qualification_unit_parts",
            key: "id"
        }
    }
  });
  await queryInterface.createTable('qualification_competence_requirements', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      field: "eperuste_id"
    },
    title: new DataTypes.STRING(128),
    qualificationUnitId: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "qualification_unit_id",
        references: {
            model: "qualification_units",
            key: "eperuste_id"
        }
    }
  });
  await queryInterface.createTable('qualification_competence_requirement', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: "eperuste_id",
      primaryKey: true,
    },
    groupId: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "group_id",
    },
    description: new DataTypes.STRING(128),
  });
  await queryInterface.createTable('competence_requirements_in_projects', {
    projectId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "qualification_project_id",
    },
    competenceRequirementId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "qualification_competence_requirement_id",
    },
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('competence_requirements_in_projects');
  await queryInterface.dropTable('qualification_competence_requirement');
  await queryInterface.dropTable('qualification_competence_requirements');
  await queryInterface.dropTable('qualification_projects_parts_relations');
  await queryInterface.dropTable('qualification_unit_parts');
  await queryInterface.dropTable('qualification_units');
  await queryInterface.dropTable('qualification_projects_tags_relations');
  await queryInterface.dropTable('qualification_project_tags');
  await queryInterface.dropTable('qualification_projects');
};
