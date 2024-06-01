const page = async () => {
  const centers = await api.user.getCenters({
    status: "all",
    owner: null,
  });

  return <div>Enter</div>;
};

export default page;
