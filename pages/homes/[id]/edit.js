import Layout from "@/components/Layout";
import ListingForm from "@/components/ListingForm";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { getSession } from "next-auth/react";
import React from "react";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const session = getSession(context);

  const redirect = {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };

  if (!session) {
    return redirect;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { listedHomes: true },
  });

  const id = context.params.id;
  const home = user?.listedHomes?.find((home) => home.id === id);
  if (!home) {
    return redirect;
  }

  return {
    props: JSON.parse(JSON.stringify({ home })),
  };
}

const Edit = (home = null) => {
  const handleOnSubmit = (data) => axios.patch(`/api/homes/${home.id}`, data);
  return (
    <Layout>
      <div className="max-w-screen-sm mx-auto">
        <h1 className="text-xl font-medium text-gray-800">Edit your home</h1>

        <p className="text-gray-500">
          Fill out the form below to update your home.
        </p>
        <div className="me-8">
          {home ? (
            <ListingForm
              buttonText="Update home"
              redirectPath={`/homes/${home.id}`}
              onSubmit={handleOnSubmit}
            />
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default Edit;
