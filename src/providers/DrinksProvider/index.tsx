import { AxiosError, AxiosResponse } from "axios";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  FC,
} from "react";
import { api } from "../../services/api";

interface Drink {
  strDrink: string;
  strDrinkThumb?: string;
  idDrink: string;
  [x: string]: any;
}

interface DrinksContextData {
  categories: Array<any>;
  drinks: Array<Drink>;
  getByCategory: any;
  getDetails: any;
  getByName: any;
  searchParameter: string;
  isLoading: boolean;
}

interface DrinksProviderProps {
  children: ReactNode;
}

const DrinksContext = createContext<DrinksContextData>({} as DrinksContextData);

const DrinksProvider: FC<DrinksProviderProps> = ({
  children,
}: DrinksProviderProps) => {
  const [categories, setCategories] = useState<any>([]);
  const [drinks, setDrinks] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParameter, setSearchParameter] = useState<string>(
    `Resultados para a categoria: "cocktail"`
  );

  const changeIsLoading = (): void => {
    setIsLoading((currentState) => !currentState);
  };

  useEffect(() => {
    changeIsLoading();
    api
      .get("/list.php?c=list")
      .then((response: AxiosResponse) => setCategories(response.data.drinks))
      .catch((error: AxiosError) => console.log(error));

    api
      .get("/filter.php?c=cocktail")
      .then((response: AxiosResponse) => {
        setDrinks(response.data.drinks);
        changeIsLoading();
      })
      .catch((error: AxiosError) => console.log(error));
  }, []);

  const getByCategory = useCallback(async (category: string): Promise<void> => {
    changeIsLoading();
    try {
      const response: AxiosResponse = await api.get(
        `/filter.php?c=${category}`
      );
      const filteredDrinks: Array<Drink> = response.data.drinks;

      setSearchParameter(`Resultados para a categoria: "${category}"`);
      setDrinks(filteredDrinks);
      changeIsLoading();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getDetails = useCallback(async (id: string): Promise<any> => {
    try {
      const response: AxiosResponse = await api.get(`/lookup.php?i=${id}`);
      const drink: Drink = response.data.drinks;

      return drink;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getByName = useCallback(async (name: string): Promise<any> => {
    changeIsLoading();
    try {
      const response: AxiosResponse = await api.get(`/search.php?s=${name}`);
      const drink: Drink = response.data.drinks;

      setSearchParameter(`Resultados para: "${name}"`);
      setDrinks(drink);
      changeIsLoading();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <DrinksContext.Provider
      value={{
        categories,
        drinks,
        getByCategory,
        getDetails,
        getByName,
        searchParameter,
        isLoading,
      }}
    >
      {children}
    </DrinksContext.Provider>
  );
};

export const useDrinks = () => useContext(DrinksContext);

export { DrinksProvider };
