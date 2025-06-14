
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddTopicSchema, type AddTopicFormInput } from '@/lib/types';
import { addTopicAction } from '@/lib/actions/topicActions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddTopicFormProps {
  onFormSubmitSuccess: () => void;
}

export function AddTopicForm({ onFormSubmitSuccess }: AddTopicFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AddTopicFormInput>({
    resolver: zodResolver(AddTopicSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: AddTopicFormInput) {
    setIsSubmitting(true);
    try {
      const result = await addTopicAction(values);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        form.reset();
        onFormSubmitSuccess();
      } else {
        toast({
          title: result.message || 'Error Adding Topic',
          description: result.error || 'An error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Client-side error in AddTopicForm:", error);
      toast({
        title: 'Error',
        description: 'An unexpected client-side error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dynamic Programming" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Adding...' : 'Add Topic'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
