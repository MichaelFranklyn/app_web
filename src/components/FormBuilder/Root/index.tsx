import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { forwardRef, useImperativeHandle, useState } from "react";
import { FieldValues, FormProvider, Path, useForm } from "react-hook-form";
import { FormBuilderProps, FormBuilderRef } from "../interface";
import { Navigation } from "../Navigation";
import { Section } from "../Section";
import { Stepper } from "../Stepper";
import { buildYupSchema } from "../utils/schema";

export const Root = forwardRef<FormBuilderRef, FormBuilderProps>(
  ({ steps, onSubmit, initialData, unstyled = false, ...props }, ref) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [schema] = useState(() => buildYupSchema(steps));

    const methods = useForm<FieldValues>({
      resolver: yupResolver(schema),
      defaultValues: (initialData || {}) as FieldValues,
      mode: "onTouched",
    });

    const isLastStep = currentStepIndex === steps.length - 1;
    const isFirstStep = currentStepIndex === 0;

    const triggerStepValidation = async () => {
      const currentStepFields: string[] = [];
      steps[currentStepIndex].sections.forEach((section) => {
        if (section.isRepeatable && section.name) {
          currentStepFields.push(section.name);
        } else {
          section.fields.forEach((field) => {
            currentStepFields.push(field.name);
          });
        }
      });
      return await methods.trigger(currentStepFields);
    };

    const handleNext = async (): Promise<boolean> => {
      const isStepValid = await triggerStepValidation();
      if (isStepValid && !isLastStep) {
        setCurrentStepIndex((prev) => prev + 1);
        return true;
      }
      return false;
    };

    const handlePrev = () => {
      if (!isFirstStep) setCurrentStepIndex((prev) => prev - 1);
    };

    useImperativeHandle(ref, () => ({
      submitForm: () => methods.handleSubmit(onSubmit)(),
      resetForm: () => methods.reset(),
      nextStep: () => handleNext(),
      prevStep: () => handlePrev(),
      setValue: (name, value) => {
        methods.setValue(name as Path<FieldValues>, value);
      },
      getValues: () => methods.getValues(),
      getStep: () => currentStepIndex,
    }));

    const activeStep = steps[currentStepIndex];

    return (
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn("flex w-full flex-col gap-6")}
        >
          {!unstyled && (
            <Stepper steps={steps} currentStepIndex={currentStepIndex} />
          )}

          <div className={cn("flex flex-col gap-8")}>
            {!unstyled && activeStep.title && (
              <Title variant="heading-md" className="mb-1">
                {activeStep.title}
              </Title>
            )}
            {!unstyled && activeStep.description && (
              <Title variant="body-md" color="muted" className="mb-6">
                {activeStep.description}
              </Title>
            )}

            <div className="flex flex-col gap-16">
              {activeStep.sections.map((section) => (
                <Section key={section.id} section={section} />
              ))}
            </div>
          </div>

          {!unstyled && (
            <Navigation
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              onPrev={handlePrev}
              onNext={handleNext}
              loading={props.loading}
              submitLabel={props.submitLabel}
              nextLabel={props.nextLabel}
              prevLabel={props.prevLabel}
            />
          )}
        </form>
      </FormProvider>
    );
  }
);

Root.displayName = "FormBuilder.Root";
