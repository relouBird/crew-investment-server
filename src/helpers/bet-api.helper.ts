export function getDateRange() {
  const today = new Date();
  const nextWeek = new Date();

  // Ajouter 7 jours
  nextWeek.setDate(today.getDate() + 7);

  // Fonction utilitaire pour formater
  const format = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return {
    dateFrom: format(today),
    dateTo: format(nextWeek),
  };
}
