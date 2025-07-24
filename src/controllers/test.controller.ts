import { TestModel } from "../models/test.model";
import { Request, Response } from "express";

// fonction qui est appelé lors de la requete et permettant de recuperer tout les tests
export const getAllTests = async (req: Request, res: Response) => {
  const test = new TestModel();
  let response: boolean = false;

  const data = await test.getAll((error) => {
    res
      .status(500)
      .send({ message: "Erreur lors de la récupération des Tests" });
    response = true;
  });

  if (!response) {
    res.status(200).json(data);
  }
};

// fonction qui permey de recuperer un test par son id
export const getTestById = async (req: Request, res: Response) => {
  const test = new TestModel();
  let response: boolean = false;

  const data = await test.getById(req.params.id, (error) => {
    res.status(500).send({
      message: "Erreur lors de la récupération du Test d'id :" + req.params.id,
    });

    response = true;
  });

  if (!response) {
    res.status(200).json(data);
  }
};
